const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const crypto = require("crypto");

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const sns = new SNSClient({});

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

const ALLOWED_PAYMENT_METHODS = ["COD", "ONLINE"];

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

function badRequest(message) {
  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ message }),
  };
}

function razorpayAuthHeader() {
  const credentials = `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

async function createRazorpayOrder(orderId, totalPrice) {
  const response = await fetch(RAZORPAY_ORDERS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: razorpayAuthHeader(),
    },
    body: JSON.stringify({
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      receipt: orderId,
      notes: { orderId },
    }),
  });

  if (!response.ok) {
    console.error(
      "Razorpay order creation failed:",
      response.status,
      await response.text(),
    );
    throw new Error("Failed to create payment order");
  }

  return response.json();
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    if (!body.items || body.items.length === 0) {
      return badRequest("Order must contain items");
    }
    if (!body.shippingAddress) {
      return badRequest("Shipping address is required");
    }
    if (!ALLOWED_PAYMENT_METHODS.includes(body.paymentMethod)) {
      return badRequest("Invalid payment method");
    }

    const claims = event.requestContext?.authorizer?.claims;
    if (!claims) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    const pricedItems = [];
    let totalItems = 0;
    let totalPrice = 0;

    for (const item of body.items) {
      const qty = Number(item.qty);
      if (!item.productId || !Number.isInteger(qty) || qty < 1) {
        return badRequest(`Invalid quantity for product: ${item.productId}`);
      }

      const result = await ddbDocClient.send(
        new GetCommand({
          TableName: process.env.PRODUCTS_TABLE_NAME,
          Key: { productId: item.productId },
        }),
      );
      const product = result.Item;
      if (!product) {
        return badRequest(`Product not found: ${item.productId}`);
      }
      if (product.countInStock < qty) {
        return badRequest(
          `Insufficient stock for ${product.name} (available: ${product.countInStock})`,
        );
      }

      pricedItems.push({
        productId: product.productId,
        name: product.name,
        image: product.image ?? "",
        price: product.price,
        qty,
      });
      totalItems += qty;
      totalPrice += product.price * qty;
    }

    const orderId = crypto.randomUUID().slice(0, 8).toUpperCase();
    const timestamp = new Date().toISOString();
    const userId = claims.sub;
    const customer = {
      userId,
      name: claims.name ?? "",
      email: claims.email ?? "",
    };
    const isOnline = body.paymentMethod === "ONLINE";

    let razorpayOrderId = null;
    let payment = null;
    if (isOnline) {
      const razorpayOrder = await createRazorpayOrder(orderId, totalPrice);
      razorpayOrderId = razorpayOrder.id;
      payment = {
        provider: "razorpay",
        razorpayOrderId,
        razorpayPaymentId: null,
        paidAt: null,
      };
    }

    const order = {
      orderId,
      userId,
      customer,
      items: pricedItems,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      totals: { totalItems, totalPrice },
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (payment) {
      order.payment = payment;
    }

    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: order,
      }),
    );

    await sns.send(
      new PublishCommand({
        TopicArn: process.env.ORDER_CREATED_TOPIC_ARN,
        Message: JSON.stringify({
          eventType: "ORDER_CREATED",
          order: {
            orderId,
            customer,
            items: pricedItems,
            shippingAddress: body.shippingAddress,
            totals: order.totals,
            paymentMethod: order.paymentMethod,
            paymentStatus: "PENDING",
            orderStatus: "PLACED",
            createdAt: timestamp,
          },
        }),
      }),
    );

    const responseBody = { message: "Order placed successfully", order };
    if (isOnline) {
      responseBody.razorpay = {
        razorpayOrderId,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: Math.round(totalPrice * 100),
        currency: "INR",
      };
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(responseBody),
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
