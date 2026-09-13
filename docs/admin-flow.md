# QueueLess — Admin & Billing Portal Flow

## Overview
The Admin Portal (`apps/admin`) provides shop owners and billing operators with a central control panel for counter operations, inventory control, billing, analytics, and staff management.

## Portal Sections

1. **Dashboard Overview**: Real-time sales metrics, order counts, pending cash transactions, and recent order stream.
2. **Quick POS Billing**: Allows staff to take manual walk-in orders quickly with cash collection and token printing.
3. **Orders Management**: Live table of all incoming orders with cash confirmation buttons and status controls (`PAID`, `READY`, `COMPLETED`).
4. **Menu & Items Management**: Add new products, update prices, change counter assignments, and instantly toggle items as `SOLD OUT`.
5. **Counter Management**: Configure physical counters (e.g. Tea Counter, Juice Counter) and assign products/staff.
6. **Staff Management**: Create staff login accounts with specific roles (`OWNER`, `ADMIN`, `BILLING`, `COUNTER_STAFF`).
7. **Analytics**: Business insights into top-selling products, sales trends, and payment breakdowns.
8. **Audit Trail**: Read-only log recording every sensitive action performed by staff.
9. **Settings & QR Generator**: View shop details and generate/print shop standee QR codes.
