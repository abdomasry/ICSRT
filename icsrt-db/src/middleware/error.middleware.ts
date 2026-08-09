import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { sendError } from '../utils/response';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`Unhandled Error: ${err.message}`, err.stack);
  
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';

  return sendError(res, message, statusCode, process.env.NODE_ENV !== 'production' ? err.stack : null);
}
