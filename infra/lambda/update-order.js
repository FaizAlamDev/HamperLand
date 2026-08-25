const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const TABLE = process.env.TABLE_NAME;

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

const ALLOWED_ORDER_STATUS = [
  "PLACED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const ALLOWED_PAYMENT_STATUS = ["PENDING", "PAID", "FAILED"];

const ORDER_STATUS_TRANSITIONS = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const PAYMENT_STATUS_TRANSITIONS = {
  PENDING: ["PAID", "FAILED"],
  PAID: [],
  FAILED: ["PAID"],
};

exports.handler = async (event) => {
  try {
    const claims = event.requestContext?.authorizer?.claims;
    if (!claims) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    const groups = claims["cognito:groups"] || [];
    if (!groups.includes("admin")) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden: Admins only" }),
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

    const { orderStatus, paymentStatus } = body;

    const existingOrderResult = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { orderId },
      }),
    );

    const existingOrder = existingOrderResult.Item;

    if (!existingOrder) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Order not found" }),
      };
    }

    const updates = [];
    const values = {};
    const names = {};

    if (
      orderStatus !== undefined &&
      orderStatus !== existingOrder.orderStatus
    ) {
      if (!ALLOWED_ORDER_STATUS.includes(orderStatus)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Invalid orderStatus" }),
        };
      }

      const currentStatus = existingOrder.orderStatus;

      const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus];

      if (!allowedTransitions.includes(orderStatus)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            message: `Cannot transition order from ${currentStatus} to ${orderStatus}`,
          }),
        };
      }

      updates.push("#orderStatus = :orderStatus");
      names["#orderStatus"] = "orderStatus";
      values[":orderStatus"] = orderStatus;
    }

    if (
      paymentStatus !== undefined &&
      paymentStatus !== existingOrder.paymentStatus
    ) {
      if (!ALLOWED_PAYMENT_STATUS.includes(paymentStatus)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Invalid paymentStatus" }),
        };
      }

      const currentPaymentStatus = existingOrder.paymentStatus;

      const allowedTransitions =
        PAYMENT_STATUS_TRANSITIONS[currentPaymentStatus];

      if (!allowedTransitions.includes(paymentStatus)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            message: `Cannot transition payment from ${currentPaymentStatus} to ${paymentStatus}`,
          }),
        };
      }

      if (existingOrder.paymentMethod !== "COD") {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            message: "Manual payment updates allowed only for COD",
          }),
        };
      }

      updates.push("#paymentStatus = :paymentStatus");
      names["#paymentStatus"] = "paymentStatus";
      values[":paymentStatus"] = paymentStatus;
    }

    if (updates.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "No valid fields to update" }),
      };
    }

    updates.push("#updatedAt = :updatedAt");
    names["#updatedAt"] = "updatedAt";
    values[":updatedAt"] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: TABLE,
      Key: { orderId },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    });

    const result = await ddbDocClient.send(command);

    if (!result.Attributes) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Order not found" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Order updated successfully",
        order: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
