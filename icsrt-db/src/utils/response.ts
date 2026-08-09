import { Response } from 'express';

export function sendSuccess(res: Response, message: string, data: Record<string, any> = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
}

export function sendError(res: Response, message: string, statusCode = 500, details: any = null) {
  const response: Record<string, any> = {
    success: false,
    message
  };
  if (details) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
}
