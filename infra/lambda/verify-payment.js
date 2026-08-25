const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

function safeEqualHex(a, b) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

exports.handler = async (event) => {
  try {
    const claims = event.requestContext?.authorizer?.claims;
    if (!claims) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    const orderId = event.pathParameters?.id;
    if (!orderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Missing orderId" }),
      };
    }

    const body = JSON.parse(event.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message:
            "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
        }),
      };
    }

    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { orderId },
      }),
    );
    const order = result.Item;

    if (!order) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Order not found" }),
      };
    }

    const groups = claims["cognito:groups"] || [];
    if (order.userId !== claims.sub && !groups.includes("admin")) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: "Forbidden" }),
      };
    }

    // The razorpay order id sent by the browser must match the one we stored
    if (
      !order.payment ||
      order.payment.provider !== "razorpay" ||
      order.payment.razorpayOrderId !== razorpay_order_id
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Payment does not belong to this order",
        }),
      };
    }

    // Idempotent: already paid
    if (order.paymentStatus === "PAID") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "Payment already verified",
          order,
        }),
      };
    }

    // HMAC-SHA256 of "<razorpay_order_id>|<razorpay_payment_id>" with the key
    // secret - this is Razorpay's documented checkout signature scheme.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeEqualHex(expectedSignature, razorpay_signature)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid payment signature" }),
      };
    }

    try {
      const updateResult = await ddbDocClient.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { orderId },
          ConditionExpression: "paymentStatus IN (:pending, :failed)",
          UpdateExpression:
            "SET #paymentStatus = :paid, #payment.#pid = :paymentId, #payment.#paidAt = :paidAt, #updatedAt = :updatedAt",
          ExpressionAttributeNames: {
            "#paymentStatus": "paymentStatus",
            "#payment": "payment",
            "#pid": "razorpayPaymentId",
            "#paidAt": "paidAt",
            "#updatedAt": "updatedAt",
          },
          ExpressionAttributeValues: {
            ":pending": "PENDING",
            ":failed": "FAILED",
            ":paid": "PAID",
            ":paymentId": razorpay_payment_id,
            ":paidAt": new Date().toISOString(),
            ":updatedAt": new Date().toISOString(),
          },
          ReturnValues: "ALL_NEW",
        }),
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "Payment verified successfully",
          order: updateResult.Attributes,
        }),
      };
    } catch (err) {
      if (err.name === "ConditionalCheckFailedException") {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            message: `Order payment is in a state that cannot transition to PAID`,
          }),
        };
      }
      throw err;
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
