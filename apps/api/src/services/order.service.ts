import { prisma } from '@queueless/database';
import { createError } from '../middleware/errorHandler';

// Generate human-readable order number like A101, A102
export async function generateOrderNumber(shopId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw createError('Shop not found', 404, 'SHOP_NOT_FOUND');

  let nextSeq: number;
  if (shop.lastOrderDate === today) {
    nextSeq = shop.dailyOrderSeq + 1;
  } else {
    nextSeq = 101; // Reset daily, start from 101
  }

  await prisma.shop.update({
    where: { id: shopId },
    data: { dailyOrderSeq: nextSeq, lastOrderDate: today },
  });

  return `${shop.orderPrefix}${nextSeq}`;
}

interface CreateOrderInput {
  shopId: string;
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  idempotencyKey?: string;
  isManual?: boolean;
}

export async function createOrder(input: CreateOrderInput) {
  const { shopId, items, paymentMethod, customerName, customerPhone, isManual } = input;
  const idempotencyKey = input.idempotencyKey || `ord-${shopId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Check idempotency — return existing order if key matches
  if (idempotencyKey) {
    const existing = await prisma.order.findUnique({
      where: { shopId_idempotencyKey: { shopId, idempotencyKey } },
      include: { items: true, payments: true },
    });
    if (existing) {
      return existing;
    }
  }

  // Get shop
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw createError('Shop not found', 404, 'SHOP_NOT_FOUND');
  if (shop.status !== 'OPEN') throw createError('Shop is currently closed', 400, 'SHOP_CLOSED');

  // Validate payment method
  if (paymentMethod === 'ONLINE' && !shop.onlinePaymentEnabled) {
    throw createError('Online payment is not available', 400, 'PAYMENT_UNAVAILABLE');
  }
  if (paymentMethod === 'CASH' && !shop.cashPaymentEnabled) {
    throw createError('Cash payment is not available', 400, 'PAYMENT_UNAVAILABLE');
  }

  // Fetch and validate all products (server-side pricing)
  const productIds = items.map((i) => i.productId);
  const products: any[] = await prisma.product.findMany({
    where: { id: { in: productIds }, shopId },
    include: { counter: true },
  });

  const productMap = new Map(products.map((p: any) => [p.id, p]));

  // Validate each item
  const orderItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    counterId: string;
    counterName: string;
  }> = [];

  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw createError(`Product not found: ${item.productId}`, 400, 'PRODUCT_NOT_FOUND');
    }
    if (product.availability !== 'AVAILABLE') {
      throw createError(`${product.name} is currently unavailable`, 400, 'PRODUCT_UNAVAILABLE');
    }
    if (item.quantity > product.maxQuantity) {
      throw createError(
        `Maximum ${product.maxQuantity} of ${product.name} allowed`,
        400,
        'QUANTITY_EXCEEDED'
      );
    }

    const totalPrice = product.price * item.quantity;
    subtotal += totalPrice;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      totalPrice,
      counterId: product.counterId,
      counterName: product.counter.name,
    });
  }

  // Calculate tax
  const taxAmount = Math.round(subtotal * (shop.taxPercent / 100) * 100) / 100;
  const total = subtotal + taxAmount;

  // Generate order number
  const orderNumber = await generateOrderNumber(shopId);

  // Determine initial status
  const initialStatus = paymentMethod === 'CASH' ? 'CASH_PENDING' : 'PAYMENT_PENDING';

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        shopId,
        orderNumber,
        status: initialStatus,
        paymentMethod,
        subtotal,
        taxAmount,
        total,
        customerName: customerName || null,
        idempotencyKey,
        isManual: isManual || false,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Create payment record
    await tx.payment.create({
      data: {
        orderId: newOrder.id,
        shopId,
        method: paymentMethod,
        status: 'PENDING',
        amount: total,
      },
    });

    // Create counter tickets (group items by counter)
    const counterMap = new Map<string, boolean>();
    for (const item of orderItems) {
      if (!counterMap.has(item.counterId)) {
        counterMap.set(item.counterId, true);
        await tx.counterTicket.create({
          data: {
            orderId: newOrder.id,
            counterId: item.counterId,
            status: 'PENDING',
          },
        });
      }
    }

    // Status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: newOrder.id,
        fromStatus: null,
        toStatus: initialStatus,
        note: 'Order created',
      },
    });

    return newOrder;
  });

  // For mock online payment, immediately confirm
  if (paymentMethod === 'ONLINE') {
    await confirmOnlinePayment(order.id, shopId, 'mock_' + Date.now());
  }

  // Reload with all relations
  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: true,
      payments: true,
      counterTickets: true,
    },
  });

  return fullOrder;
}

export async function confirmOnlinePayment(orderId: string, shopId: string, providerRef: string) {
  await prisma.$transaction(async (tx: any) => {
    await tx.payment.updateMany({
      where: { orderId, shopId, method: 'ONLINE' },
      data: { status: 'SUCCESS', providerRef, confirmedAt: new Date() },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: 'PAYMENT_PENDING',
        toStatus: 'CONFIRMED',
        note: 'Online payment confirmed',
      },
    });
  });
}

export async function confirmCashPayment(orderId: string, shopId: string, confirmedBy: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, shopId },
  });

  if (!order) throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (order.status !== 'CASH_PENDING') {
    throw createError('Order is not pending cash payment', 400, 'INVALID_STATUS');
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.payment.updateMany({
      where: { orderId, shopId, method: 'CASH' },
      data: { status: 'SUCCESS', confirmedBy, confirmedAt: new Date() },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: 'CASH_PENDING',
        toStatus: 'CONFIRMED',
        changedBy: confirmedBy,
        note: 'Cash payment confirmed',
      },
    });
  });

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true, counterTickets: true },
  });
}

export async function updateOrderStatus(orderId: string, newStatus: string, note?: string, changedBy?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw createError('Order not found', 404, 'ORDER_NOT_FOUND');

  await prisma.$transaction(async (tx: any) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: newStatus,
        changedBy: changedBy || null,
        note: note || null,
      },
    });
  });

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true, counterTickets: true },
  });
}

export async function getOrderByNumber(shopId: string, orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { shopId_orderNumber: { shopId, orderNumber } },
    include: {
      items: true,
      payments: true,
      counterTickets: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!order) throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
  return order;
}

export async function getOrderById(orderId: string, shopId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, shopId },
    include: {
      items: true,
      payments: true,
      counterTickets: { include: { counter: true } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!order) throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
  return order;
}

export async function updateCounterTicketStatus(
  ticketId: string,
  counterId: string,
  status: string,
  _shopId?: string
) {
  const ticket = await prisma.counterTicket.findFirst({
    where: { id: ticketId, counterId },
    include: { order: true },
  });

  if (!ticket) throw createError('Ticket not found', 404, 'TICKET_NOT_FOUND');

  const updateData: any = { status };
  if (status === 'ACCEPTED') updateData.acceptedAt = new Date();
  if (status === 'READY') updateData.readyAt = new Date();

  await prisma.counterTicket.update({
    where: { id: ticketId },
    data: updateData,
  });

  // Check if all counter tickets for this order are READY
  if (status === 'READY') {
    const allTickets = await prisma.counterTicket.findMany({
      where: { orderId: ticket.orderId },
    });

    const allReady = allTickets.every((t: any) => t.id === ticketId || t.status === 'READY');

    if (allReady) {
      await prisma.order.update({
        where: { id: ticket.orderId },
        data: { status: 'READY' },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: ticket.orderId,
          fromStatus: ticket.order.status,
          toStatus: 'READY',
          note: 'All counters ready',
        },
      });
    }
  }

  return prisma.counterTicket.findUnique({
    where: { id: ticketId },
    include: { order: { include: { items: true } }, counter: true },
  });
}

// ---- Class wrapper for dependency injection in routes ----
export class OrderService {
  createOrder = createOrder;
  confirmOnlinePayment = confirmOnlinePayment;
  confirmCashPayment = confirmCashPayment;
  updateOrderStatus = updateOrderStatus;
  getOrderByNumber = getOrderByNumber;
  getOrderById = getOrderById;
  updateCounterTicketStatus = updateCounterTicketStatus;
}
