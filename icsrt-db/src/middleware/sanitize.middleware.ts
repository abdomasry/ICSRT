import { Express } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

export function setupSecurityMiddleware(app: Express) {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(mongoSanitize());
}

export default setupSecurityMiddleware;
