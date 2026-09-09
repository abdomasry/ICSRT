import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { AuthenticatedRequest, AuthUserPayload } from '../types';
import { sendError } from '../utils/response';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr;

  if (!token) {
    return sendError(res, 'Admin authentication required', 401, 'ADMIN_AUTH_REQUIRED');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
      return sendError(res, 'Admin privileges required', 403, 'ADMIN_ACCESS_REQUIRED');
    }
    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired authentication token', 401, 'INVALID_TOKEN');
  }
};

export const requireUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr;

  if (!token) {
    return sendError(res, 'Authentication required', 401, 'AUTH_REQUIRED');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid authentication token', 401, 'AUTH_REQUIRED');
    }
    req.user = decoded;
    if (decoded.role === 'admin' || decoded.role === 'super_admin') {
      req.admin = decoded;
    }
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired authentication token', 401, 'INVALID_TOKEN');
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      if (decoded) {
        req.user = decoded;
        if (decoded.role === 'admin' || decoded.role === 'super_admin') {
          req.admin = decoded;
        }
      }
    } catch {
      // Optional auth: silent fallback to anonymous if token invalid
    }
  }
  next();
};
