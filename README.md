# Multi-Tenant RBAC Demo

A demonstration of role-based access control (RBAC) in a multi-tenant application using Next.js, TypeScript, and Cloud Firestore.

## Overview

This app showcases:

- **Multi-tenant isolation**: Each tenant (e.g. Tenant A, Tenant B) can only see and modify their own data.
- **Role-based permissions**: Users with admin role have more permissions than staff users.
- **Mock authentication**: Simple client-side auth context (no Firebase Auth integration).
- **Clean data-access layer**: All Firestore logic is centralized in lib/orders.ts with RBAC enforcement.

## Features

### Authentication (Mock)

- **Login page** (`/login`): Select tenant, role, and username.
- State stored in React Context (AuthContext).
- No real identity verification (demo-only).

### Orders Management

- **Create orders**: Specify customer name and initial status.
- **Update status**: Change order status with role-based restrictions.
- **Delete orders**: Only admins can delete.
- **Tenant isolation**: Users only see orders for their assigned tenant.

## RBAC Rules

### Admin Role

- ✅ Change order status to `pending`, `in_progress`, or `completed`
- ✅ Delete orders

### Staff Role

- ✅ Change order status from `pending` → `in_progress` only
- ❌ Cannot change to any other status
- ❌ Cannot delete orders

## Firestore Data Model

### `tenants` collection

```
tenants/
  tenantA/
    name: "Tenant A"
  tenantB/
    name: "Tenant B"
```

### `orders` collection

```
orders/
  {orderId}/
    tenantId: "tenantA" | "tenantB"
    customerName: "Alice Johnson"
    status: "pending" | "in_progress" | "completed"
```

**Tenant isolation is enforced at the query level**: All Firestore queries filter by `tenantId`, and updates/deletes verify that the order belongs to the user's tenant before proceeding.

## Local Setup

### Prerequisites

- Node.js 18+ and npm or yarn
- A Firebase project (or use the placeholder config for local development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd multi-tenant-rbac-demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase (optional)**

   By default, the app uses a placeholder Firebase config in `lib/firebase.ts`.
   To use your own Firebase project, create a `.env.local` file at the project root:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

   If you're just testing locally with the placeholder config, you can skip this.

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000/login` in your browser.

### Demo Flow

1. **Login**

   - Select Tenant A or Tenant B
   - Select admin or staff role
   - Enter a username
   - Click Login

2. **Dashboard**

   - See the current tenant, role, and username.
   - Click Seed Demo Data to populate sample orders (one-time setup).
   - Use Create New Order to add new orders.
   - Use status buttons to change order status (RBAC rules apply).
   - Delete button appears only for admins.

3. **Permission Enforcement**
   - If a staff user tries to delete an order or move to an invalid status, an error message appears.
   - All permission checks are implemented in `lib/orders.ts` (data-access layer).

## Project Structure

```
app/
  context/AuthContext.tsx       # Mock auth state & hooks
  login/page.tsx                # Login page UI
  orders/page.tsx               # Main orders dashboard
  layout.tsx                    # Root layout with AuthProvider
  globals.css                   # Global styles

lib/
  firebase.ts                   # Firebase client initialization
  orders.ts                     # Data-access layer with RBAC enforcement

components/
  CreateOrderForm.tsx           # Form to create new orders
  OrderList.tsx                 # Fetch & display orders
  OrderItem.tsx                 # Individual order display + actions

public/                         # Static assets
```

## RBAC & Tenant Isolation Logic

### Where is RBAC enforced?

All RBAC and tenant checks live in `lib/orders.ts`:

- `getOrdersForTenant(tenantId)`: Returns only that tenant's orders.
- `updateOrderStatus(...)`: Validates role and allowed state transitions.
- `deleteOrder(...)`: Ensures only admins can delete.

Both update/delete operations verify the order's `tenantId` matches the current user's `tenantId`.

Errors are thrown with descriptive messages and surfaced in the UI (e.g. "Permission denied: staff cannot delete orders.").

### How is tenant isolation enforced?

1. **Query level**: `getOrdersForTenant()` uses `where('tenantId', '==', tenantId)`.
2. **Update/Delete level**: `updateOrderStatus()` and `deleteOrder()` fetch the order, check `order.tenantId === tenantId`, then proceed.
3. **Input validation**: The UI passes `tenantId` from `AuthContext`, and the data-access layer always receives it as an explicit parameter.

## Deploying to Firebase Hosting

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in to Firebase: `firebase login`

### Deployment Steps

1. **Build the Next.js app**

   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting**

   ```bash
   firebase deploy
   ```

   This uses the existing `firebase.json` and `firestore.rules` in the repo.

3. **Access your app**

   ```
   https://<your-project-id>.web.app
   ```

## Limitations

- **Mock authentication only**: No real user identity. State is cleared on page refresh.
- **Client-side RBAC**: Rules are enforced in the browser, not in Firestore Security Rules.
- **No auth persistence**: Auth state is not stored in localStorage/sessionStorage.
- **Public Firebase config**: Config is exposed in the client (acceptable for a demo, but requires strong security rules in production).

## Future Plans & Roadmap

### Short Term

- 🔐 **Add Firestore Security Rules**

  - Enforce tenant isolation (`tenantId`) at the database level.
  - Enforce role-based operations (admin vs staff) on reads/writes.

- 👤 **Integrate Real Authentication**

  - Use Firebase Authentication (email/password or OAuth).
  - Map authenticated users to tenants and roles.

- 💾 **Persist Auth State**
  - Store auth context in localStorage or cookies.
  - Automatically restore the session on page reload.

### Medium Term

- 🧩 **API Layer & Server-Side RBAC**

  - Introduce Next.js API routes or server actions.
  - Move RBAC checks from client-side to server-side.
  - Add centralized error handling and request validation.

- 📊 **Improved Orders UI**

  - Filtering, sorting, and pagination.
  - Status badges, search by customer name.
  - Better empty/loading/error states.

- 📝 **Audit Logging**
  - Log status changes and deletions (who did what and when).
  - Display basic activity history per order.

### Longer Term

- 🏢 **Advanced Tenant Management**

  - Tenant admin dashboard for managing users and roles.
  - Support more than two tenants and dynamic tenant creation.

- 🚀 **Production-Grade Hardening**

  - CI/CD pipeline (lint, tests, deploy).
  - Rate limiting / basic abuse protection.
  - Monitoring and logging integration (e.g. Cloud Logging).

- 🌐 **Multi-Region / Scalability Considerations**
  - Evaluate Firestore/hosting region choices per tenant.
  - Plan for higher data volumes and more complex RBAC rules.

## Technologies Used

- **Next.js** (App Router)
- **React** with TypeScript
- **Cloud Firestore** (Firebase Web Client SDK)
- **PostCSS** for styling (minimal CSS)

## License

MIT (or your preferred license).
