# QueueLess — System Architecture & Design

## Executive Summary

QueueLess is an end-to-end QR-based digital ordering and billing system designed specifically for high-footfall food counters, tea stalls, juice shops, canteens, and small food outlets across India. Its principal mandate is to eliminate physical billing queues by empowering customers to scan a QR code at table/counter, browse the menu, select items, and pay digitally (or opt for cash at billing) while order tokens are routed instantly to specific preparation counters and admin screens in real-time.

## High-Level Architecture Diagram

```
                        ┌─────────────────────────────────────┐
                        │           Customer Phone            │
                        │ (Scans Shop Standee / Table QR)     │
                        └──────────────────┬──────────────────┘
                                           │ HTTP / HTTPS
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           QueueLess Monorepo Architecture                        │
│                                                                                  │
│   ┌─────────────────────────┐    ┌────────────────────┐   ┌──────────────────┐   │
│   │   apps/customer (React) │    │ apps/admin (React) │   │ packages/types   │   │
│   └────────────┬────────────┘    └─────────┬──────────┘   └────────┬─────────┘   │
│                │ REST                      │ REST                  │             │
│                ▼                           ▼                       │             │
│   ┌───────────────────────────────────────────────────┐            │             │
│   │          apps/api (Express + Socket.IO)           │            │             │
│   │                                                   │            │             │
│   │  ├── Public Routes (/api/public/*)                │            │             │
│   │  ├── Admin Routes (/api/admin/*)                  │◄───────────┘             │
│   │  ├── Counter Routes (/api/counter/*)              │ Shared Types             │
│   │  └── Socket Manager (shop:* & counter:* rooms)    │                          │
│   │                                                   │                          │
│   │  Services:                                        │                          │
│   │  ├── OrderService (Price snapshots, order tokens) │                          │
│   │  ├── PaymentService (Online gateway abstraction)  │                          │
│   │  ├── PrinterService (ESC/POS & browser print)     │                          │
│   │  ├── AnalyticsService (Real DB aggregation)       │                          │
│   │  └── AuditService (Immutable action logs)         │                          │
│   └──────────────────────────┬────────────────────────┘                          │
│                              │                                                   │
│                              ▼                                                   │
│                   packages/database (Prisma ORM)                                 │
│                              │                                                   │
│                              ▼                                                   │
│                  SQLite (Dev) / PostgreSQL (Prod)                                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Architectural Highlights

1. **Multi-Tenant Isolation**: All database models are scoped by `shopId`. Middleware enforces strict tenant isolation for API requests.
2. **Immutable Price Snapshots**: Prices are snapshotted in `OrderItem` at purchase time, ensuring historical financial records remain unchanged if item prices are altered later.
3. **Counter Routing**: Orders with multi-counter items (e.g. Tea + Samosa) are routed independently to respective physical counter screens via `OrderItemCounter` tracking.
4. **Resilient WebSocket Communication**: Real-time event broadcasting powered by Socket.IO with fallback long-polling support.
