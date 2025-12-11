# Multi-Tenant RBAC Demo

A demonstration of **role-based access control (RBAC)** in a multi-tenant application using **Next.js**, **TypeScript**, and **Cloud Firestore**.

## Overview

This app showcases:

- **Multi-tenant isolation**: Each tenant (Tenant A, Tenant B) can only see and modify their own data.
- **Role-based permissions**: Users with `admin` role have more permissions than `staff` users.
- **Mock authentication**: Simple client-side auth context (no Firebase Auth integration).
- **Clean data-access layer**: All Firestore logic centralized in `lib/orders.ts` with RBAC enforcement.

## Features

### Authentication (Mock)

- **Login page** (`/login`): Select tenant, role, and username.
- State stored in React Context (`AuthContext`).
- No real identity verification (for demo purposes only).

### Orders Management

- **Create orders**: Specify customer name and initial status.
- **Update status**: Change order status with role-based restrictions.
- **Delete orders**: Only admins can delete.
- **Tenant isolation**: Users only see orders for their assigned tenant.

### RBAC Rules

#### Admin Role

- ✅ Change order status to `pending`, `in_progress`, or `completed`
- ✅ Delete orders

#### Staff Role

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

**Tenant isolation is enforced at the query level**: All Firestore queries filter by `tenantId`, and updates/deletes verify the order belongs to the user's tenant before proceeding.

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

   By default, the app uses a placeholder Firebase config in `lib/firebase.ts`. To use your own Firebase project:

   Create a `.env.local` file at the project root:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

   (If using the placeholder config, you can skip this.)

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000/login` in your browser.

### Demo Flow

1. **Login**:

   - Select "Tenant A" or "Tenant B"
   - Select "admin" or "staff" role
   - Enter a username
   - Click "Login"

2. **Dashboard**:

   - You'll see your assigned tenant, role, and username.
   - Click "Seed Demo Data" to populate sample orders (one-time setup).
   - Use the "Create New Order" form to add orders.
   - Click status buttons to change order status (respects RBAC rules).
   - Delete button appears only for admins.

3. **Permission Enforcement**:
   - If a staff user tries to delete an order or change status to an invalid state, an error message appears.
   - All permission checks happen in `lib/orders.ts` (data-access logic).

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

**`lib/orders.ts`** contains all permission and tenant checks:

- `updateOrderStatus()`: Validates role and allowed state transitions.
- `deleteOrder()`: Ensures only admins can delete.
- `getOrdersForTenant()`: Queries only the specified tenant's orders.

All errors are thrown with descriptive messages and caught in the UI (e.g., "Permission denied: staff cannot delete orders.").

### How is tenant isolation enforced?

1. **Query level**: `getOrdersForTenant()` uses `where('tenantId', '==', tenantId)`.
2. **Update/Delete level**: `updateOrderStatus()` and `deleteOrder()` fetch the order first and verify `order.tenantId === tenantId` before proceeding.
3. **Input validation**: The UI passes `tenantId` from `AuthContext`, and the data-access layer accepts it as a parameter.

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

   This will use the existing `firebase.json` and `firestore.rules` in the repo.

3. **Access your app**
   ```
   https://<your-project-id>.web.app
   ```

## Limitations & Future Improvements

### Current Limitations

- **Mock authentication**: No real user identity. State is cleared on page refresh.
- **Client-side RBAC only**: Rules are enforced in the browser. For production, implement Firestore Security Rules.
- **No persistence**: Auth state is lost on refresh. Use localStorage or session storage for persistence.
- **Firestore exposed**: Firebase config is public (but appropriate for demo; use security rules in production).

### Recommended Improvements

1. **Firestore Security Rules**: Enforce multi-tenant & role-based access at the database level.
2. **Real Firebase Auth**: Integrate Firebase Authentication for real identity.
3. **Session persistence**: Save auth state to `localStorage` and restore on app load.
4. **Server-side rendering**: Pre-fetch orders on the server to improve performance.
5. **Advanced UI**: Add filtering, sorting, pagination for large order lists.
6. **Audit logging**: Track who made what changes and when.
7. **API rate limiting & validation**: Add server-side validation and rate limiting for production.

## Technologies Used

- **Next.js 16** (App Router)
- **TypeScript**
- **React 19**
- **Cloud Firestore** (Firebase Web Client SDK)
- **PostCSS** for styling (minimal CSS)

## License

MIT (or your preferred license)
