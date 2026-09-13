import { Request, Response, NextFunction } from 'express';

export const enforceTenantIsolation = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  // Extract shop ID from request params, query, or body if present
  const targetShopId = req.params.shopId || req.query.shopId || req.body?.shopId;

  if (targetShopId && req.user.shopId !== targetShopId) {
    res.status(403).json({ 
      success: false, 
      error: 'Tenant Isolation Error: Cannot access data belonging to another shop' 
    });
    return;
  }

  next();
};
