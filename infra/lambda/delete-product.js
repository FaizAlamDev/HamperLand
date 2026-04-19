const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const TABLE = process.env.TABLE_NAME;
const REGION = process.env.AWS_REGION;

const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    console.log("EVENT:", JSON.stringify(event));

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

    const productId = event.pathParameters.id;

    if (!productId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Missing productId" }),
      };
    }

    const command = new DeleteCommand({
      TableName: TABLE,
      Key: { productId },
      ReturnValues: "ALL_OLD",
    });

    const result = await ddbDocClient.send(command);

    if (!result.Attributes) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Product deleted successfully",
        deletedProduct: result.Attributes,
      }),
    };
  } catch (err) {
    console.error("DELETE ERROR:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
