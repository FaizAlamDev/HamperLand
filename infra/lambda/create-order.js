const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    if (!body.items || body.items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Order must contain items" }),
      };
    }
    if (!body.shippingAddress) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Shipping address is required" }),
      };
    }

    const orderId = crypto.randomUUID().slice(0, 8).toUpperCase();
    const timestamp = new Date().toISOString();
    const claims = event.requestContext?.authorizer?.claims;
    if (!claims) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }
    const userId = claims.sub;

    const order = {
      orderId,
      userId,
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      totals: body.totals,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const command = new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: order,
    });

    await ddbDocClient.send(command);

    console.log("Creating order for user:", userId);
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: "Order placed successfully",
        order: order,
      }),
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
