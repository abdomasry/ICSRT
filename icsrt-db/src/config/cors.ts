import { CorsOptions } from 'cors';
import { getProductionDomains } from './env';

const envOrigins = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const productionDomains = getProductionDomains();

export const allowedOrigins = envOrigins.length ? envOrigins : [
  ...productionDomains,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:5173',
  'icsrt.vercel.app',
  'https://icsrt.vercel.app',
  'icsrt-l4691rw62-abdomasry2711-4527s-projects.vercel.app',
  'https://icsrt-l4691rw62-abdomasry2711-4527s-projects.vercel.app',
];

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, true);
    }
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || 
        origin.match(/https?:\/\/(192\.168\.|10\.)\d+\.\d+:\d+/)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.endsWith('.icsrt.cloud') || origin === 'https://icsrt.cloud') {
      return callback(null, true);
    }
    console.warn(`⚠️ Blocked by CORS: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Access-Control-Allow-Headers', 
    'Access-Control-Request-Method', 
    'Access-Control-Request-Headers',
    'x-user-id',
    'x-user-role',
    'x-user-email'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};
