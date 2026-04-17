import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

export const checkDB = (req: Request, res: Response, next: NextFunction) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection is not established. Please configure MONGODB_URI in the Secrets panel.'
    });
  }
  next();
};
