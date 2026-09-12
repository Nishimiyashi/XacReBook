import jwt from 'jsonwebtoken';
import { env } from './env.js';

export type UserTokenPayload = { sub: string; kind: 'user' };
export type AdminTokenPayload = { sub: string; kind: 'admin' };

export function signUserToken(userId: string): string {
  const payload: UserTokenPayload = { sub: userId, kind: 'user' };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function signAdminToken(adminId: string): string {
  const payload: AdminTokenPayload = { sub: adminId, kind: 'admin' };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });
}

export function verifyToken<T extends UserTokenPayload | AdminTokenPayload>(token: string): T | null {
  try {
    return jwt.verify(token, env.jwtSecret) as T;
  } catch {
    return null;
  }
}
