const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
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
    const body = JSON.parse(event.body);

    const command = new UpdateCommand({
      TableName: TABLE,
      Key: { productId },
      UpdateExpression:
        "SET #name = :name, price = :price, description = :desc, countInStock = :stock",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": body.name,
        ":price": body.price,
        ":desc": body.description,
        ":stock": body.countInStock,
      },
      ReturnValues: "ALL_NEW",
    });

    const result = await ddbDocClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Attributes),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: "Error updating product",
    };
  }
};
