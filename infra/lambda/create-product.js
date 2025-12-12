const crypto = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.BUCKET_NAME;
const TABLE = process.env.TABLE_NAME;
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

const s3Client = new S3Client({ region: REGION });
const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  try {
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body || {};
    if (
      !body.name ||
      !body.description ||
      typeof body.price === "undefined" ||
      typeof body.countInStock === "undefined"
    ) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          error:
            "Missing required fields: name, price, description or countInStock",
        }),
      };
    }

    const productId = crypto.randomUUID();

    const filename = body.filename
      ? sanitizeFilename(body.filename)
      : "image.jpg";
    const imageKey = `products/${productId}/${filename}`;

    const contentType =
      body.contentType ||
      guessContentTypeFromFilename(filename) ||
      "image/jpeg";

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET,
      Key: imageKey,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 300,
    });

    const productItem = {
      productId,
      name: body.name,
      description: body.description || "",
      price: Number(body.price),
      countInStock: Number(body.countInStock || 0),
      imageKey,
      image: `https://${CLOUDFRONT_DOMAIN}/${imageKey}`,
    };

    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: productItem,
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Presigned URL generated.",
        uploadUrl: presignedUrl,
        product: productItem,
      }),
    };
  } catch (err) {
    console.error("create-product error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message || "Internal error" }),
    };
  }
};

function sanitizeFilename(name) {
  return name.replace(/[^A-Za-z0-9._-]/g, "_");
}

function guessContentTypeFromFilename(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return null;
  }
}
