# Hamperland

A full-stack e-commerce project with a React frontend and AWS-backed infrastructure.
It supports product browsing, cart + checkout flow, authentication via Cognito (Google + email/password), and protected admin operations.

---

## Features

- Product listing and details
- Cart and checkout flow
- Order creation and success page
- My Orders Page
- User Profile Page
- Admin product create, update and delete
- Authentication via Cognito (Google + email/password)
- Protected admin routes (`admin` group required)
- Order confirmation emails for customers
- Order notification emails for admin users
- Automated CI/CD with GitHub Actions, AWS IAM Roles, and OIDC-based authentication

---

## Tech stack

### Frontend

- React 19, Vite, TypeScript
- TanStack Router, TanStack Query
- Zustand (cart state)
- Tailwind CSS + Radix UI

### Infra

- AWS CDK (TypeScript)
- S3 (frontend hosting, product images)
- CloudFront (CDN)
- Lambda (API)
- API Gateway (Cognito authorizer)
- Cognito (auth + groups)
- DynamoDB (products, orders)
- SNS (order events)
- SES (email notifications)
- SQS Dead Letter Queue (DLQ)
- GitHub Actions (CI/CD)
- AWS IAM
- OpenID Connect (OIDC)

---

## Architecture

- Frontend is built with Vite and deployed to S3
- CloudFront serves both frontend and product images
- API Gateway routes requests to Lambda functions
- Lambda functions handle products, orders and notification workflows
- DynamoDB stores product and order data
- Cognito handles authentication and authorization
- SNS publishes order events
- Email notifications are sent via SES
- Failed message processing is routed to an SQS Dead Letter Queue (DLQ)
- GitHub Actions automates build and deployment workflows

---

## Environment variables

### Frontend (`frontend/.env`)

```env
VITE_PRODUCT_API_URL=
VITE_ORDERS_API_URL=

VITE_COGNITO_DOMAIN=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_AUTHORITY=
```

---

### Infra (`infra/.env`)

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FROM_EMAIL=
USER_POOL_ID=
```

---

## First-time AWS setup

Before deploying the application for the first time, complete the following setup steps.

### 1. Bootstrap CDK

Bootstrap the target AWS account and region:

```bash
cd infra
npx cdk bootstrap
```

This only needs to be done once per AWS account and region.

### 2. Configure Google OAuth

Create OAuth credentials in Google Cloud Console.

Add the generated values to `infra/.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

These credentials are used to configure Google as an identity provider for Cognito.

### 3. Verify an SES Sender Identity

Open AWS SES and verify an email address or domain that will be used to send emails.

Example:

```text
noreply@example.com
```

Add the verified email address to the GitHub secret:

```text
FROM_EMAIL
```

Email notifications will fail if the sender identity is not verified.

### 4. Configure GitHub OIDC

Create an OIDC Identity Provider in AWS:

```text
Provider URL:
https://token.actions.githubusercontent.com

Audience:
sts.amazonaws.com
```

Create an IAM Role that:

- Trusts the GitHub OIDC provider
- Can be assumed by this repository
- Has permissions required for CDK deployment

Typical permissions include:

- CloudFormation
- IAM
- Lambda
- API Gateway
- Cognito
- DynamoDB
- S3
- CloudFront
- SNS
- SQS
- SES

### 5. Configure GitHub Secrets

Add the following repository secrets:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
FROM_EMAIL
USER_POOL_ID
```

### 6. Deploy

```bash
pnpm deploy
```

---

## Local development

```bash
pnpm install

cd frontend
pnpm dev
```

App runs on http://localhost:3000

---

## Deployment

```bash
pnpm deploy
```

This:

- Builds frontend
- Deploys CDK stack
- Uploads assets to S3
- Invalidates CloudFront cache
- Serves the application through CloudFront

---

## Project structure

### Frontend

```
src/
  api/            # API calls (products, orders)
  components/     # UI + feature components
  hooks/          # React Query hooks
  routes/         # File-based routes
  store/          # Zustand store
  integrations/   # Providers
  lib/            # Utilities
  types/          # Types
```

---

### Infra

```
infra/
  # CDK definitions for:
  # - S3 (frontend + images)
  # - CloudFront distributions
  # - Lambda functions
  # - API Gateway
  # - Cognito (auth, Google provider, groups)
  # - DynamoDB (products, orders)
```

---

## Routing

- `/`
- `/product/:id`
- `/cart`
- `/checkout`
- `/order-success/:orderId`
- `/my-orders`
- `profile`
- `/admin/createProduct` (protected)
- `/admin/listProducts` (protected)
- `/admin/orders` (protected)

---

## Access control

- Authenticated users:
  - View profile
  - View their orders
  - Create orders

- Admin users (Cognito group: `admin`):
  - Create products
  - Update products
  - Delete products

---

## Scripts

```bash
pnpm build:frontend
pnpm deploy:infra
pnpm deploy
```

---

## CI/CD

GitHub Actions is used to automate validation and deployment.

### Continuous Integration

On pull requests:

- Install dependencies
- Typecheck frontend
- Build the frontend

### Continuous Deployment

On merges to the main branch:

- Install dependencies
- Configure AWS Credentials
- Build frontend assets
- Deploy AWS infrastructure using CDK
- Upload frontend assets to S3
- Update CloudFront-served application

### Authentication

Deployments authenticate to AWS using GitHub OIDC and an IAM role configured for GitHub Actions.

This eliminates the need to store long-lived AWS access keys as GitHub secrets and allows deployments to assume temporary AWS credentials through OpenID Connect.

## License

ISC
