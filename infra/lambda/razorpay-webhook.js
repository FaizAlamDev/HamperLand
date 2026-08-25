const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const headers = {
  "Content-Type": "application/json",
};

// Maps Razorpay events to our payment status
const EVENT_TO_PAYMENT_STATUS = {
  "payment.captured": "PAID",
  "order.paid": "PAID",
  "payment.failed": "FAILED",
};

const ALLOWED_FROM_STATES = {
  PAID: ["PENDING", "FAILED"],
  FAILED: ["PENDING"],
};

exports.handler = async (event) => {
  try {
    const signature =
      event.headers?.["x-razorpay-signature"] ||
      event.headers?.["X-Razorpay-Signature"];
    const rawBody = event.body ?? "";

    if (!signature) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing signature" }) };
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const bufA = Buffer.from(expectedSignature, "utf8");
    const bufB = Buffer.from(signature, "utf8");
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      console.error("Webhook signature verification failed");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid signature" }),
      };
    }

    const webhook = JSON.parse(rawBody);
    const eventType = webhook.event;
    const targetStatus = EVENT_TO_PAYMENT_STATUS[eventType];

    if (!targetStatus) {
      // Not an event we act on - acknowledge so Razorpay stops retrying
      return { statusCode: 200, headers, body: JSON.stringify({ ignored: true }) };
    }

    const paymentEntity = webhook.payload?.payment?.entity;
    // Our orderId is passed through Razorpay order notes at creation time
    const orderId = paymentEntity?.notes?.orderId;
    if (!orderId) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ignored: true, reason: "No orderId in notes" }),
      };
    }

    const conditionValues = {
      ":updatedAt": new Date().toISOString(),
    };

    let updateExpression;
    if (targetStatus === "PAID") {
      updateExpression =
        "SET #paymentStatus = :paid, #payment.#pid = :paymentId, #payment.#paidAt = :paidAt, #updatedAt = :updatedAt";
      conditionValues[":paid"] = "PAID";
      conditionValues[":paymentId"] = paymentEntity.id;
      conditionValues[":paidAt"] = new Date().toISOString();
    } else {
      updateExpression =
        "SET #paymentStatus = :failed, #payment.#pid = :paymentId, #payment.#failedAt = :failedAt, #updatedAt = :updatedAt";
      conditionValues[":failed"] = "FAILED";
      conditionValues[":paymentId"] = paymentEntity.id;
      conditionValues[":failedAt"] = new Date().toISOString();
    }

    const allowedFrom = ALLOWED_FROM_STATES[targetStatus];
    const conditionNames = {
      "#paymentStatus": "paymentStatus",
      "#payment": "payment",
      "#pid": "razorpayPaymentId",
      "#paidAt": "paidAt",
      "#failedAt": "failedAt",
      "#updatedAt": "updatedAt",
    };

    const conditionExpression = allowedFrom
      .map((state, i) => {
        const key = `:from${i}`;
        conditionValues[key] = state;
        return `#paymentStatus = ${key}`;
      })
      .join(" OR ");

    try {
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { orderId },
          ConditionExpression: conditionExpression,
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: conditionNames,
          ExpressionAttributeValues: conditionValues,
        }),
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ handled: true, status: targetStatus }),
      };
    } catch (err) {
      if (err.name === "ConditionalCheckFailedException") {
        // Already processed or in a non-transitionable state - acknowledge
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ handled: false, reason: "State already advanced" }),
        };
      }
      throw err;
    }
  } catch (error) {
    // Non-2xx makes Razorpay retry the delivery
    console.error("Error processing Razorpay webhook:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
