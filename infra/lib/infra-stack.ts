import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket
    const productImagesBucket = new s3.Bucket(this, "ProductImagesBucket", {
      versioned: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT],
          allowedOrigins: ["*"], // In production, replace '*' with your domain
          allowedHeaders: ["*"],
        },
      ],
    });

    // Cloudfront
    const distribution = new cloudfront.Distribution(
      this,
      "ProductDistribution",
      {
        defaultBehavior: {
          origin:
            origins.S3BucketOrigin.withOriginAccessControl(productImagesBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          compress: true,
        },
      }
    );

    productImagesBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: "AllowCloudFrontServiceRead",
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        actions: ["s3:GetObject"],
        resources: [`${productImagesBucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": distribution.distributionArn,
          },
        },
      })
    );

    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: distribution.distributionDomainName,
    });

    // DynamoDB Tables
    const productsTable = new dynamodb.Table(this, "ProductsTable", {
      partitionKey: { name: "productId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 25,
      writeCapacity: 25,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const ordersTable = new dynamodb.Table(this, "OrdersTable", {
      partitionKey: { name: "orderId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Function
    const createProductLambda = new lambda.Function(
      this,
      "CreateProductHandler",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "create-product.handler",
        environment: {
          BUCKET_NAME: productImagesBucket.bucketName,
          TABLE_NAME: productsTable.tableName,
          CLOUDFRONT_DOMAIN: distribution.distributionDomainName,
        },
      }
    );

    const getProductsLambda = new lambda.Function(this, "GetProductsHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "get-products.handler",
      environment: {
        TABLE_NAME: productsTable.tableName,
      },
    });

    const createOrderLambda = new lambda.Function(this, "CreateOrderHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "create-order.handler",
      environment: {
        TABLE_NAME: ordersTable.tableName,
      },
    });

    const getOrderLambda = new lambda.Function(this, "GetOrderHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "get-order.handler",
      environment: {
        TABLE_NAME: ordersTable.tableName,
      },
    });

    // Permissions
    productsTable.grantWriteData(createProductLambda);
    productsTable.grantReadData(getProductsLambda);
    productImagesBucket.grantPut(createProductLambda);
    ordersTable.grantWriteData(createOrderLambda);
    ordersTable.grantReadData(getOrderLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, "ProductApi", {
      restApiName: "Ecommerce Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const productsResource = api.root.addResource("products");
    productsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createProductLambda)
    );
    productsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsLambda)
    );

    const ordersResource = api.root.addResource("orders");
    ordersResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createOrderLambda)
    );

    const singleOrderResource = ordersResource.addResource("{id}");
    singleOrderResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getOrderLambda)
    );
  }
}
