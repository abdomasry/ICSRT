import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  return next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal Server Error';
  let details = err.details || err.errors || null;

  // 1. Handle Mongo Duplicate Key Error (Code 11000)
  if (err.code === 11000 || err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate entry: '${field}' with value '${err.keyValue?.[field]}' already exists`;
  }

  // 2. Handle Mongo CastError / invalid ObjectId
  else if (err.name === 'CastError' || err.name === 'BSONError') {
    statusCode = 400;
    code = 'INVALID_ID_FORMAT';
    message = `Invalid ID format for resource identifier`;
  }

  // 3. Handle JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid access token provided';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Access token has expired, please log in again';
  }

  // 4. Handle Zod Validation Errors
  else if (err.name === 'ZodError' && Array.isArray(err.issues)) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = err.issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
      rule: issue.code
    }));
  }

  // 5. Handle Network / Upstream Timeouts
  else if (err.code === 'ECONNABORTED' || err.name === 'TimeoutError' || err.code === 'ETIMEDOUT') {
    statusCode = 504;
    code = 'GATEWAY_TIMEOUT';
    message = 'Upstream service request timed out';
  }

  // 6. Mask unexpected 500 server errors in production
  if (statusCode >= 500) {
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    // Structured server-side logging with method and path
    logger.error(`🔥 [${statusCode} ${code}] ${req.method} ${req.originalUrl}:`, {
      message: err.message,
      stack: err.stack,
      statusCode,
      code
    });

    if (!isDev && !err.isOperational) {
      message = 'An unexpected server error occurred. Please try again later.';
      details = null;
    }
  } else {
    logger.warn(`⚠️ [${statusCode} ${code}] ${req.method} ${req.originalUrl}: ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    message,
    code,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  });
}
