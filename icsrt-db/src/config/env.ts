import dotenv from 'dotenv';
dotenv.config();

export const DATABASE_NAME = process.env.DATABASE_NAME || "icsrt_main";
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://icsrt:admin@icsrt.3iuzx9u.mongodb.net/?retryWrites=true&w=majority";
export const PORT = parseInt(process.env.PORT || "3000", 10);
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
export const JWT_SECRET = process.env.JWT_SECRET || 'icsrt-dashboard-secret-key-2024';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET || '';
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || '';

export const getProductionDomains = (): string[] => {
  const domains: string[] = [];
  if (process.env.NODE_ENV === 'production') {
    domains.push('https://icsrt.cloud');
    domains.push('https://admin.icsrt.cloud');
  }
  return domains;
};

export const getFrontendUrl = (): string => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://icsrt.cloud';
  }
  return 'http://localhost:3002';
};

export const getApiUrl = (): string => {
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return getFrontendUrl();
  }
  return 'http://localhost:3000';
};
