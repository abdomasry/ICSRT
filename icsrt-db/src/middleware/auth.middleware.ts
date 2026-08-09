import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { AuthenticatedRequest, AuthUserPayload } from '../types';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr;

  const origin = req.headers.origin || '';
  const isUserSite = origin.includes('icsrt.cloud') && !origin.includes('admin.');

  if (isUserSite && req.path.startsWith('/api/service-orders')) {
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', code: 'ADMIN_AUTH_REQUIRED' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden', code: 'ADMIN_AUTH_REQUIRED' });
    }
    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'ADMIN_AUTH_REQUIRED' });
  }
};

export const requireUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr;

  if (!token) {
    return res.status(401).json({ error: 'No token provided', code: 'USER_AUTH_REQUIRED' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    if (!decoded || (decoded.role !== 'user' && decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden', code: 'USER_AUTH_REQUIRED' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'USER_AUTH_REQUIRED' });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch (err) {
      // Ignored in optionalAuth
    }
  }
  next();
};
