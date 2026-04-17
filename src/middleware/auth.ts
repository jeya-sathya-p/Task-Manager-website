import { Request, Response, NextFunction } from 'express';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).userId) {
    next();
  } else {
    res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};
