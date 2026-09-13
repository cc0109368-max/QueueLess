import { prisma } from '@queueless/database';

export class AnalyticsService {
  async getDashboardOverview(shopId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      todaySalesResult,
      onlineOrders,
      cashOrders,
      pendingCash,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { shopId, createdAt: { gte: today } },
      }),
      prisma.order.aggregate({
        where: {
          shopId,
          createdAt: { gte: today },
          status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'] },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { shopId, createdAt: { gte: today }, paymentMethod: 'ONLINE' },
      }),
      prisma.order.count({
        where: { shopId, createdAt: { gte: today }, paymentMethod: 'CASH' },
      }),
      prisma.order.count({
        where: { shopId, status: 'CASH_PENDING' },
      }),
      prisma.order.count({
        where: { shopId, createdAt: { gte: today }, status: 'COMPLETED' },
      }),
      prisma.order.count({
        where: { shopId, createdAt: { gte: today }, status: 'CANCELLED' },
      }),
    ]);

    return {
      todayOrders,
      todaySales: todaySalesResult._sum.total || 0,
      onlineOrders,
      cashOrders,
      pendingCash,
      completedOrders,
      cancelledOrders,
    };
  }

  async getSalesAnalytics(shopId: string, startDate?: Date, endDate?: Date) {
    const sevenDaysAgo = startDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    const end = endDate || new Date();

    // Popular products
    const popularProducts = await prisma.orderItem.groupBy({
      by: ['productName'],
      where: {
        order: {
          shopId,
          createdAt: { gte: sevenDaysAgo, lte: end },
          status: { notIn: ['CANCELLED', 'FAILED'] },
        },
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      where: { shopId, createdAt: { gte: sevenDaysAgo, lte: end } },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Revenue grouped by day
    const weeklyOrders = await prisma.order.findMany({
      where: {
        shopId,
        createdAt: { gte: sevenDaysAgo, lte: end },
        status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'] },
      },
      select: { total: true, createdAt: true },
    });

    const dailyRevenue: Record<string, number> = {};
    for (const order of weeklyOrders) {
      const day = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[day] = (dailyRevenue[day] || 0) + order.total;
    }

    return {
      popularProducts: popularProducts.map((p: any) => ({
        name: p.productName,
        totalQuantity: p._sum.quantity || 0,
        totalRevenue: p._sum.totalPrice || 0,
      })),
      recentOrders,
      dailyRevenue,
    };
  }
}
