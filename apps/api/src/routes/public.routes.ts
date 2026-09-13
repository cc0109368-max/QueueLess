import { Router, Request, Response } from 'express';
import { prisma } from '@queueless/database';
import { createOrderSchema } from '@queueless/validation';
import { createOrder, confirmOnlinePayment } from '../services/order.service';

export const publicRouter = Router();

// Get menu by shop slug
publicRouter.get('/shops/:slug/menu', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            products: {
              where: { availability: { not: 'DISABLED' } },
              orderBy: { sortOrder: 'asc' },
              include: { counter: true },
            },
          },
        },
      },
    });

    if (!shop) {
      res.status(404).json({ success: false, error: 'Shop not found' });
      return;
    }

    res.json({ success: true, shop });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new customer order
publicRouter.post('/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
      return;
    }

    const order = await createOrder(parseResult.data);
    res.status(201).json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get order status by order number or ID
publicRouter.get('/orders/:orderRef', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderRef } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderRef }, { orderNumber: orderRef }],
      },
      include: {
        items: true,
        counterTickets: {
          include: { counter: true },
        },
        payments: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        shop: {
          select: { name: true, description: true },
        },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Payment webhook (Mock / Razorpay stub)
publicRouter.post('/payments/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, shopId, paymentId, status } = req.body;
    if (status === 'SUCCESS' && orderId && shopId) {
      await confirmOnlinePayment(orderId, shopId, paymentId || 'webhook_' + Date.now());
    }
    res.json({ success: true, received: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
