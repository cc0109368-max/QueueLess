import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@queueless/database';
import { loginSchema } from '@queueless/validation';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'queueless-dev-secret-change-in-production';

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
      return;
    }

    const { email, password } = parseResult.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        staffMemberships: {
          include: {
            shop: true,
            counter: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const primaryMembership = user.staffMemberships[0];
    if (!primaryMembership) {
      res.status(403).json({ success: false, error: 'User is not assigned to any shop' });
      return;
    }

    const payload = {
      userId: user.id,
      shopId: primaryMembership.shopId,
      role: primaryMembership.role,
      counterId: primaryMembership.counterId || undefined,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: primaryMembership.role,
        shopId: primaryMembership.shopId,
        shopName: primaryMembership.shop.name,
        counterId: primaryMembership.counterId,
        counterName: primaryMembership.counter?.name,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
