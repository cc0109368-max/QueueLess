import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const memoryStore: RateLimitStore = {};

export const createRateLimiter = (options: { windowMs: number; max: number; message?: string }) => {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!memoryStore[key] || memoryStore[key].resetTime < now) {
      memoryStore[key] = { count: 1, resetTime: now + windowMs };
      next();
      return;
    }

    memoryStore[key].count++;

    if (memoryStore[key].count > max) {
      res.status(429).json({ success: false, error: message });
      return;
    }

    next();
  };
};
