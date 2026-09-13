# QueueLess — Payment Provider Architecture

## Architecture

QueueLess abstracts payment providers behind a unified `PaymentProvider` interface:

```typescript
export interface PaymentProvider {
  name: string;
  createPayment(orderId: string, amount: number, metadata?: any): Promise<PaymentResponse>;
  verifyPayment(paymentId: string, signature: string): Promise<boolean>;
}
```

## Supported Providers

1. **Mock Payment Provider (Default Dev Provider)**:
   - Simulates instant UPI / online payments for development and testing.
2. **Razorpay Provider (Production Stub)**:
   - Integrates with Razorpay API for Indian UPI (GPay, PhonePe, Paytm), Net Banking, and Cards.
3. **Cash at Counter**:
   - Order is created in `PENDING` payment state. Customer pays cash to billing staff, who clicks **Cash Recd** on admin portal to mark order `PAID`.
