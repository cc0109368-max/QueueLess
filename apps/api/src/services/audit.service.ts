import { prisma } from '@queueless/database';

interface LogActionParams {
  shopId: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any> | string;
}

export class AuditService {
  async logAction(params: LogActionParams) {
    const details =
      typeof params.details === 'object'
        ? JSON.stringify(params.details)
        : params.details || null;

    return prisma.auditLog.create({
      data: {
        shopId: params.shopId,
        userId: params.userId || null,
        userName: params.userName || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details,
      },
    });
  }

  async getLogs(shopId: string, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: { shopId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
