import { Router, Request, Response } from 'express';
import { prisma } from '@queueless/database';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { enforceTenantIsolation } from '../middleware/tenantIsolation';
import { OrderService } from '../services/order.service';
import { AnalyticsService } from '../services/analytics.service';
import { AuditService } from '../services/audit.service';
import { PrinterService } from '../services/printer.service';
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  createCounterSchema,
  createStaffSchema,
  createOrderSchema,
} from '@queueless/validation';
import { UserRole } from '@queueless/types';
import bcrypt from 'bcryptjs';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(enforceTenantIsolation);

const orderService = new OrderService();
const analyticsService = new AnalyticsService();
const auditService = new AuditService();
const printerService = new PrinterService();

// ==================== DASHBOARD & ANALYTICS ====================

adminRouter.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = req.user!.shopId;
    const overview = await analyticsService.getDashboardOverview(shopId);
    res.json({ success: true, ...overview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = req.user!.shopId;
    const { startDate, endDate } = req.query;
    const analytics = await analyticsService.getSalesAnalytics(
      shopId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json({ success: true, analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== ORDERS MANAGEMENT ====================

adminRouter.get('/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const shopId = req.user!.shopId;
    const { status, page = '1', limit = '20' } = req.query;

    const where: any = { shopId };
    if (status) where.status = status;

    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          counterTickets: { include: { counter: true } },
          payments: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      orders,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.patch('/orders/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const order = await orderService.updateOrderStatus(id, status, note, req.user!.id);

    await auditService.logAction({
      shopId: req.user!.shopId,
      userId: req.user!.id,
      action: 'UPDATE_ORDER_STATUS',
      entity: 'Order',
      entityId: id,
      details: { newStatus: status, note },
    });

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminRouter.post('/orders/:id/cash-confirm', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.confirmCashPayment(id, req.user!.shopId, req.user!.id);

    await auditService.logAction({
      shopId: req.user!.shopId,
      userId: req.user!.id,
      action: 'CONFIRM_CASH_PAYMENT',
      entity: 'Order',
      entityId: id,
      details: { orderNumber: order?.orderNumber, amount: order?.total },
    });

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminRouter.get('/orders/:id/receipt', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true, shop: true },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const paymentStatus = order.payments[0]?.status ?? 'PENDING';
    const createdAt = new Date(order.createdAt);

    const receiptText = printerService.formatReceipt({
      shopName: order.shop.name,
      shopDescription: order.shop.description || undefined,
      orderNumber: order.orderNumber,
      date: createdAt.toLocaleDateString('en-IN'),
      time: createdAt.toLocaleTimeString('en-IN'),
      paymentMethod: order.paymentMethod,
      paymentStatus,
      items: order.items.map((i: any) => ({
        name: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      total: order.total,
    });

    res.json({ success: true, receiptText });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/orders/manual', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = {
      ...req.body,
      shopId: req.user!.shopId,
      idempotencyKey: req.body.idempotencyKey || `manual-${req.user!.id}-${Date.now()}`,
      isManual: true,
    };

    const parseResult = createOrderSchema.safeParse(body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
      return;
    }

    const order = await orderService.createOrder(parseResult.data);

    // Auto confirm cash payment if order placed by billing staff
    if (order && order.paymentMethod === 'CASH') {
      await orderService.confirmCashPayment(order.id, req.user!.shopId, req.user!.id);
    }

    await auditService.logAction({
      shopId: req.user!.shopId,
      userId: req.user!.id,
      action: 'CREATE_MANUAL_ORDER',
      entity: 'Order',
      entityId: order?.id,
      details: { orderNumber: order?.orderNumber, total: order?.total },
    });

    res.status(201).json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==================== PRODUCT CRUD ====================

adminRouter.get('/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { shopId: req.user!.shopId },
      include: { category: true, counter: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post(
  '/products',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = createProductSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
        return;
      }

      const product = await prisma.product.create({
        data: {
          ...parseResult.data,
          shopId: req.user!.shopId,
        },
      });

      await auditService.logAction({
        shopId: req.user!.shopId,
        userId: req.user!.id,
        action: 'CREATE_PRODUCT',
        entity: 'Product',
        entityId: product.id,
        details: { name: product.name, price: product.price },
      });

      res.status(201).json({ success: true, product });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

adminRouter.patch(
  '/products/:id',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const parseResult = updateProductSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
        return;
      }

      const product = await prisma.product.update({
        where: { id },
        data: parseResult.data,
      });

      await auditService.logAction({
        shopId: req.user!.shopId,
        userId: req.user!.id,
        action: 'UPDATE_PRODUCT',
        entity: 'Product',
        entityId: product.id,
        details: parseResult.data,
      });

      res.json({ success: true, product });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

adminRouter.delete(
  '/products/:id',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.product.update({
        where: { id },
        data: { availability: 'DISABLED' },
      });

      await auditService.logAction({
        shopId: req.user!.shopId,
        userId: req.user!.id,
        action: 'DELETE_PRODUCT',
        entity: 'Product',
        entityId: id,
      });

      res.json({ success: true, message: 'Product disabled' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

// ==================== CATEGORIES CRUD ====================

adminRouter.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { shopId: req.user!.shopId },
      include: { products: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post(
  '/categories',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = createCategorySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
        return;
      }

      const category = await prisma.category.create({
        data: {
          ...parseResult.data,
          shopId: req.user!.shopId,
        },
      });

      res.status(201).json({ success: true, category });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

adminRouter.patch(
  '/categories/:id',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await prisma.category.update({
        where: { id },
        data: req.body,
      });
      res.json({ success: true, category });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

adminRouter.delete(
  '/categories/:id',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.category.delete({
        where: { id },
      });
      res.json({ success: true, message: 'Category deleted' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

// ==================== COUNTERS CRUD ====================

adminRouter.get('/counters', async (req: Request, res: Response): Promise<void> => {
  try {
    const counters = await prisma.counter.findMany({
      where: { shopId: req.user!.shopId },
      include: { products: true, staffMemberships: true },
    });
    res.json({ success: true, counters });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post(
  '/counters',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = createCounterSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
        return;
      }

      const counter = await prisma.counter.create({
        data: {
          ...parseResult.data,
          shopId: req.user!.shopId,
        },
      });

      res.status(201).json({ success: true, counter });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

adminRouter.patch(
  '/counters/:id',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const counter = await prisma.counter.update({
        where: { id },
        data: req.body,
      });
      res.json({ success: true, counter });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

// ==================== STAFF CRUD ====================

adminRouter.get(
  '/staff',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const staffMembers = await prisma.staffMembership.findMany({
        where: { shopId: req.user!.shopId },
        include: { user: true, counter: true },
      });
      res.json({ success: true, staffMembers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

adminRouter.post(
  '/staff',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = createStaffSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
        return;
      }

      const { email, password, name, role, counterId } = parseResult.data;
      const passwordHash = await bcrypt.hash(password, 10);

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: { email, passwordHash, name },
        });
      }

      const membership = await prisma.staffMembership.create({
        data: {
          userId: user.id,
          shopId: req.user!.shopId,
          role: role as UserRole,
          counterId: counterId || undefined,
        },
        include: { user: true, counter: true },
      });

      res.status(201).json({ success: true, staff: membership });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

adminRouter.patch(
  '/staff/:id',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { role, counterId, isActive } = req.body;
      const membership = await prisma.staffMembership.update({
        where: { id },
        data: { role, counterId, isActive },
        include: { user: true, counter: true },
      });
      res.json({ success: true, staff: membership });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

// ==================== AUDIT LOGS ====================

adminRouter.get(
  '/audit-logs',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = await auditService.getLogs(req.user!.shopId);
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ==================== SETTINGS ====================

adminRouter.get('/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: req.user!.shopId },
    });
    res.json({ success: true, settings: shop });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.patch(
  '/settings',
  requireRole([UserRole.OWNER, UserRole.ADMIN]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const shop = await prisma.shop.update({
        where: { id: req.user!.shopId },
        data: req.body,
      });

      await auditService.logAction({
        shopId: req.user!.shopId,
        userId: req.user!.id,
        action: 'UPDATE_SHOP_SETTINGS',
        entity: 'Shop',
        entityId: shop.id,
        details: req.body,
      });

      res.json({ success: true, settings: shop });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);
