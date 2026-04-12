import * as dotenv from "dotenv";
dotenv.config();

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cognito from "aws-cdk-lib/aws-cognito";
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
      },
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
      }),
    );

    // DynamoDB Tables
    const productsTable = new dynamodb.Table(this, "ProductsTable", {
      partitionKey: { name: "productId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const ordersTable = new dynamodb.Table(this, "OrdersTable", {
      partitionKey: { name: "orderId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
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
      },
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

    // COGNITO USER POOL
    const userPool = new cognito.UserPool(this, "UserPool", {
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
      },

      accountRecovery: cognito.AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
      selfSignUpEnabled: true,
      signInCaseSensitive: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // GOOGLE IDENTITY PROVIDER
    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(
      this,
      "Google",
      {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecretValue: cdk.SecretValue.unsafePlainText(
          process.env.GOOGLE_CLIENT_SECRET!,
        ),
        userPool,
        scopes: ["openid", "email", "profile"],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          fullname: cognito.ProviderAttribute.GOOGLE_NAME,
        },
      },
    );

    // USER POOL CLIENT (OAuth)
    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,

      preventUserExistenceErrors: true,
      enableTokenRevocation: true,

      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: ["http://localhost:3000"],
        logoutUrls: ["http://localhost:3000"],
      },

      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
    });

    userPoolClient.node.addDependency(googleProvider);

    // HOSTED UI DOMAIN
    const domain = userPool.addDomain("CognitoDomain", {
      cognitoDomain: {
        domainPrefix: "hamperland-auth",
      },
    });

    new cdk.CfnOutput(this, "CognitoDomain", {
      value: domain.domainName,
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "OrdersAuthorizer",
      {
        cognitoUserPools: [userPool],
      },
    );

    // API Gateway
    const api = new apigateway.RestApi(this, "ProductApi", {
      restApiName: "Ecommerce Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    const productsResource = api.root.addResource("products");
    productsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createProductLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    );
    productsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsLambda),
    );

    const ordersResource = api.root.addResource("orders");
    ordersResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createOrderLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    );

    const singleOrderResource = ordersResource.addResource("{id}");
    singleOrderResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getOrderLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      },
    );
  }
}
