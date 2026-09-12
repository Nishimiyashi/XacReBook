import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type AdminTokenPayload, type UserTokenPayload } from '../lib/jwt.js';

export const USER_COOKIE = 'xrb_session';
export const ADMIN_COOKIE = 'xrb_admin';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      adminId?: string;
    }
  }
}

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[USER_COOKIE];
  if (token) {
    const payload = verifyToken<UserTokenPayload>(token);
    if (payload?.kind === 'user') {
      req.userId = payload.sub;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }
  next();
}

export function attachAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (token) {
    const payload = verifyToken<AdminTokenPayload>(token);
    if (payload?.kind === 'admin') {
      req.adminId = payload.sub;
    }
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.adminId) {
    return res.status(401).json({ error: 'Админ нэвтрэх шаардлагатай' });
  }
  next();
}
