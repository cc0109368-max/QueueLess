import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@queueless/types';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ success: false, error: 'Permission denied: insufficient role privileges' });
      return;
    }

    next();
  };
};
