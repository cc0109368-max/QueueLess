# QueueLess — Database Schema & Data Models

## Relational Entity Overview

The database uses Prisma ORM with 14 normalized models:

1. `Shop`: Multi-tenant root entity storing slug, business info, opening hours, and configuration.
2. `User`: Account entity for shop owners, admins, billing staff, and counter staff.
3. `StaffMembership`: Junction table linking `User` → `Shop` with strict RBAC roles (`OWNER`, `ADMIN`, `BILLING`, `COUNTER_STAFF`).
4. `Category`: Menu category hierarchy per shop with explicit `sortOrder`.
5. `Counter`: Physical preparation counter entity (e.g., Tea Counter, Juice Counter, Hot Snacks Counter).
6. `Product`: Menu item containing price, category, counter mapping, and availability status (`AVAILABLE`, `SOLD_OUT`, `DISABLED`).
7. `Order`: Master order record containing human-readable token number (e.g. `A101`), total amount, subtotal, tax, payment status, and order status.
8. `OrderItem`: Line items containing product ID, snapshot unit price, quantity, and total item price.
9. `OrderItemCounter`: Granular item preparation state per counter.
10. `Payment`: Payment transaction audit trail (Online/Cash).
11. `OrderStatusHistory`: Audit trail tracking every order status transition with timestamps and user attribution.
12. `AuditLog`: Immutable action trail logging admin modifications (product changes, settings updates, cash confirmations).
13. `ShopSettings`: Shop feature flags and operational configs.
14. `DailySequence`: Atomic sequence generator for daily order numbers reset every midnight per shop.

## Key Design Patterns

### Atomic Order Token Generation
Order numbers follow `{prefix}{dailySequence}` format (e.g. `A101`). They are generated using atomic increment operations on `DailySequence` scoped per `shopId` and `dateStr` (`YYYY-MM-DD`).

### Multi-Counter Order Splitting
When an order includes items across multiple counters:
- `Order` holds the global transaction.
- `OrderItemCounter` splits preparation tasks by counter.
- Counter staff at the Tea Counter only see tea items, while Snacks Counter staff only see snacks items.
