import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env';
import { AuthUserPayload } from '../types';

export function signToken(payload: AuthUserPayload, expiresIn: string = JWT_EXPIRES_IN): string {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch (error) {
    return null;
  }
}
