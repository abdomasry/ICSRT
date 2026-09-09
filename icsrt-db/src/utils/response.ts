import { Response } from 'express';

export function sendSuccess(res: Response, message: string, data: Record<string, any> = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    statusCode,
    ...data,
    timestamp: new Date().toISOString()
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code?: string,
  details: any = null
) {
  const defaultCode = statusCode === 400 ? 'BAD_REQUEST'
    : statusCode === 401 ? 'AUTH_REQUIRED'
    : statusCode === 403 ? 'FORBIDDEN'
    : statusCode === 404 ? 'NOT_FOUND'
    : statusCode === 409 ? 'CONFLICT'
    : statusCode === 422 ? 'VALIDATION_ERROR'
    : statusCode === 429 ? 'RATE_LIMITED'
    : statusCode === 503 ? 'SERVICE_UNAVAILABLE'
    : statusCode === 504 ? 'GATEWAY_TIMEOUT'
    : 'INTERNAL_SERVER_ERROR';

  return res.status(statusCode).json({
    success: false,
    error: message,
    message,
    code: code || defaultCode,
    statusCode,
    details: details || null,
    timestamp: new Date().toISOString()
  });
}
