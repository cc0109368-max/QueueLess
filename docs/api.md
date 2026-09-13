# QueueLess — REST API Reference Specification

## Base URL
`/api`

## Authentication
Admin and Counter endpoints require a JSON Web Token passed in the Authorization header:
`Authorization: Bearer <JWT_TOKEN>`

## Endpoint Groups

### 1. Public Endpoints (No Auth)
- `GET /api/public/shops/:slug/menu` — Returns shop profile, active categories, and available menu products.
- `POST /api/public/orders` — Submits a new customer order. Performs price recalculation, sold-out checks, and token assignment.
- `GET /api/public/orders/:orderRef` — Retrieves order status, token number, and receipt data by Order ID or Order Token.
- `POST /api/public/payments/webhook` — Webhook handler for online payment gateways (Mock/Razorpay).

### 2. Authentication
- `POST /api/auth/login` — Authenticates staff/admin users and returns JWT token + user profile.

### 3. Admin Endpoints (JWT Required)
- `GET /api/admin/dashboard` — Returns real-time metrics (today sales, order counts, pending cash orders, payment split).
- `GET /api/admin/orders` — Filterable/searchable orders list.
- `PATCH /api/admin/orders/:id/status` — Updates order status (`PAID`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`).
- `POST /api/admin/orders/:id/cash-confirm` — Confirms cash collection for an order at billing counter.
- `GET /api/admin/orders/:id/receipt` — Generates printable thermal receipt text.
- `POST /api/admin/orders/manual` — Quick POS order creation by billing staff.
- `GET /api/admin/products` — List all products.
- `POST /api/admin/products` — Create product item.
- `PATCH /api/admin/products/:id` — Update product or toggle availability status.
- `DELETE /api/admin/products/:id` — Soft-delete / disable product.
- `GET /api/admin/categories` — List menu categories.
- `POST /api/admin/categories` — Create menu category.
- `GET /api/admin/counters` — List shop physical counters.
- `POST /api/admin/counters` — Create physical counter.
- `GET /api/admin/staff` — List staff accounts.
- `POST /api/admin/staff` — Create staff account.
- `GET /api/admin/analytics` — Detailed sales and top product metrics.
- `GET /api/admin/audit-logs` — Read-only immutable action trail.
- `GET /api/admin/settings` — Read shop configuration.
- `PATCH /api/admin/settings` — Update shop configuration.

### 4. Counter Endpoints (JWT Required)
- `GET /api/counter/:counterId/orders` — Active kitchen items assigned to specific counter.
- `PATCH /api/counter/:counterId/items/:itemId/status` — Update item preparation status (`PENDING` → `PREPARING` → `READY`).
