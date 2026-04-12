# Hamperland

A full-stack e-commerce project with a React frontend and AWS-backed infrastructure.
It supports product browsing, cart + checkout flow, authentication via Cognito (Google + email/password), and protected admin operations.

---

## Features

- Product listing and details
- Cart and checkout flow
- Order creation and success page
- Admin product creation
- Authentication via Cognito (Google + email/password)
- Protected admin routes (`admin` group required)

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

---

## Architecture

- Frontend is built with Vite and deployed to S3
- CloudFront serves both frontend and product images
- API Gateway routes requests to Lambda functions
- Lambda functions handle products and orders
- DynamoDB stores product and order data
- Cognito handles authentication and authorization

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
- Serves via CloudFront

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
- `/admin/createProduct` (protected)

---

## Access control

- Authenticated users:
  - Create orders

- Admin users (Cognito group: `admin`):
  - Create products

---

## Scripts

```bash
pnpm build:frontend
pnpm deploy:infra
pnpm deploy
```

---

## License

ISC
