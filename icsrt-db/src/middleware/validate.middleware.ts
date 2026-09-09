import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: ZodSchema<any>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.params && typeof req.params === 'object') {
      Object.assign(req.params, parsed.params);
    }
    if (parsed.query && typeof req.query === 'object') {
      Object.assign(req.query, parsed.query);
    }

    return next();
  } catch (error: any) {
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map(err => ({
        field: err.path.filter(p => p !== 'body' && p !== 'query' && p !== 'params').join('.'),
        message: err.message
      }));
      const combinedMessage = formattedErrors.map(e => e.field ? `${e.field}: ${e.message}` : e.message).join(', ');
      return next(new ValidationError(combinedMessage || 'Validation failed for request payload', formattedErrors));
    }
    return next(error);
  }
};
