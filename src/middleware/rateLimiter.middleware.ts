import { Request, Response, NextFunction } from 'express';

let rateLimit: any = null;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  // express-rate-limit fallback
}

const dummyLimiter = (req: Request, res: Response, next: NextFunction) => next();

export const globalLimiter = rateLimit ? rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
}) : dummyLimiter;

export const authLimiter = rateLimit ? rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please wait a minute.' }
}) : dummyLimiter;
