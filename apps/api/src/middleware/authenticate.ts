import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

// Augment Express Request to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        shopId: string;
        shopName: string;
        counterId: string | null;
      };
    }
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || 'queueless-dev-secret-change-in-production';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      id: decoded.userId,
      email: decoded.email || '',
      name: decoded.name || '',
      role: decoded.role,
      shopId: decoded.shopId,
      shopName: decoded.shopName || '',
      counterId: decoded.counterId || null,
    };

    next();
  } catch (err: any) {
    if (err.statusCode) {
      next(err);
    } else {
      next(createError('Invalid or expired token', 401, 'INVALID_TOKEN'));
    }
  }
}
