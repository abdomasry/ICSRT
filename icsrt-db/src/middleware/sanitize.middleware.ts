import { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

export function setupSecurityMiddleware(app: Express) {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Safe Express 5 mongoSanitize middleware to avoid req.query re-assignment crash
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    if (req.query && typeof req.query === 'object') {
      mongoSanitize.sanitize(req.query);
    }
    next();
  });
}

export default setupSecurityMiddleware;
