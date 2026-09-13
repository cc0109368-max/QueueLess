import { Router, Request, Response } from 'express';
import { prisma } from '@queueless/database';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { updateCounterTicketStatus } from '../services/order.service';
import { UserRole } from '@queueless/types';

export const counterRouter = Router();
counterRouter.use(authenticate);
counterRouter.use(requireRole([UserRole.OWNER, UserRole.ADMIN, UserRole.COUNTER_STAFF]));

// Get active counter tickets for a counter
counterRouter.get('/:counterId/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const { counterId } = req.params;

    const tickets = await prisma.counterTicket.findMany({
      where: {
        counterId,
        status: { not: 'READY' }, // Only show pending/in-progress
      },
      include: {
        order: {
          include: {
            items: {
              where: { counterId }, // Only items for this counter
            },
          },
        },
        counter: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, tickets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all counter tickets (including READY) for a counter
counterRouter.get('/:counterId/tickets', async (req: Request, res: Response): Promise<void> => {
  try {
    const { counterId } = req.params;
    const { status } = req.query;

    const where: any = { counterId };
    if (status) where.status = status;

    const tickets = await prisma.counterTicket.findMany({
      where,
      include: {
        order: {
          include: {
            items: { where: { counterId } },
          },
        },
        counter: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, tickets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update counter ticket status (ACCEPTED → PREPARING → READY)
counterRouter.patch(
  '/:counterId/tickets/:ticketId/status',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { counterId, ticketId } = req.params;
      const { status } = req.body;

      if (!['ACCEPTED', 'PREPARING', 'READY'].includes(status)) {
        res.status(400).json({ success: false, error: 'Invalid status. Must be ACCEPTED, PREPARING, or READY.' });
        return;
      }

      const ticket = await updateCounterTicketStatus(ticketId, counterId, status);
      res.json({ success: true, ticket });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);
