// Payment Provider Abstraction
// This interface allows swapping payment gateways via environment variables

export interface PaymentProvider {
  name: string;
  createPayment(orderId: string, amount: number, metadata?: any): Promise<PaymentResponse>;
  verifyWebhook(payload: any, signature: string): Promise<boolean>;
}

export interface PaymentResponse {
  providerRef: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  redirectUrl?: string;
}

// Mock Payment Provider for development
export class MockPaymentProvider implements PaymentProvider {
  name = 'mock';

  async createPayment(orderId: string, amount: number): Promise<PaymentResponse> {
    // Simulate instant payment success for dev
    return {
      providerRef: `mock_${orderId}_${Date.now()}`,
      status: 'SUCCESS',
    };
  }

  async verifyWebhook(payload: any, _signature: string): Promise<boolean> {
    // In dev mode, always accept
    return true;
  }
}

// Razorpay Provider stub (connect real keys in production)
export class RazorpayProvider implements PaymentProvider {
  name = 'razorpay';

  async createPayment(orderId: string, amount: number): Promise<PaymentResponse> {
    // TODO: Integrate real Razorpay API
    // const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: orderId });
    throw new Error('Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }

  async verifyWebhook(payload: any, signature: string): Promise<boolean> {
    // TODO: Verify Razorpay webhook signature
    // const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    throw new Error('Razorpay webhook verification not configured');
  }
}

// Factory
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || 'mock';
  switch (provider) {
    case 'razorpay':
      return new RazorpayProvider();
    case 'mock':
    default:
      return new MockPaymentProvider();
  }
}
