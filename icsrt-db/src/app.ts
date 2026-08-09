import express from 'express';
import cors from 'cors';
import path from 'path';
import { corsOptions } from './config/cors';
import setupSecurityMiddleware from './middleware/sanitize.middleware';
import { globalLimiter } from './middleware/rateLimiter.middleware';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app = express();

app.set('trust proxy', 1);

app.use(cors(corsOptions));
setupSecurityMiddleware(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(globalLimiter);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
