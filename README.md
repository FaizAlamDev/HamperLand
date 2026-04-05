# Hamperland

A small e-commerce frontend built with React, Vite, and TanStack Router.
It covers a basic shopping flow — browsing products, cart, checkout, and order confirmation — along with a minimal admin flow for creating products.

---

## What this project does

- Browse products
- View product details
- Add/remove items from cart
- Checkout and create orders
- View order success page
- Basic admin page to create products

This repo also contains an `infra` package using AWS CDK.

---

## Tech stack

Frontend:

- React 19
- Vite
- TypeScript
- TanStack Router
- TanStack Query
- Zustand
- Tailwind CSS + Radix UI

Infra:

- AWS CDK (TypeScript)

---

## Getting started

### Prerequisites

- Node.js (>= 18)
- pnpm

---

### Install

```bash
pnpm install
```

---

### Environment variables

Create a `.env` file in the `frontend` directory:

```env
VITE_PRODUCT_API_URL=
VITE_ORDERS_API_URL=
```

---

### Run frontend

```bash
cd frontend
pnpm dev
```

App runs on:
http://localhost:3000

---

### Build

```bash
pnpm build
```

---

### Preview build

```bash
pnpm serve
```

---

## Project structure (frontend)

```
src/
  api/            # API calls (products, orders)
  components/     # UI + feature components
  hooks/          # React Query hooks
  routes/         # File-based routes
  store/          # Zustand store (cart)
  integrations/   # Providers (React Query)
  lib/            # Utilities
  types/          # Types
```

---

## Routing

- `/` → product listing
- `/product/:id` → product details
- `/cart` → cart
- `/checkout` → checkout
- `/order-success/:orderId` → success page
- `/admin/createProduct` → admin page

---

## State management

- Server state → TanStack Query
- Client state → Zustand (cart)

---

## API layer

```
src/api/
  products.ts
  orders.ts
```

Uses fetch for requests.

---

## UI

- Tailwind CSS
- Radix UI primitives
- Reusable components in `components/ui`

---

## Infra (AWS CDK)

Located in `infra/`.

### Commands

```bash
cd infra

npx tsc
npx cdk synth
npx cdk deploy
```

---

## Notes

- Uses TanStack Router file-based routing
- Query setup: `integrations/tanstack-query/root-provider.tsx`
- Cart state: `useCartStore.ts`
- Backend APIs are expected separately

---

## License

ISC
