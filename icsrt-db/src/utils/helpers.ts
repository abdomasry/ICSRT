import crypto from 'crypto';
import { ObjectId } from 'mongodb';

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function parseObjectId(id: any): ObjectId | null {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string' && ObjectId.isValid(id)) {
    try {
      return new ObjectId(id);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function sanitizeUser(user: any): any {
  if (!user) return null;
  const { password, verificationToken, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
  return safeUser;
}
