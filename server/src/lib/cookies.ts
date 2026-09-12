import type { CookieOptions } from 'express';
import { env } from './env.js';

export function cookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/',
  };
}

export const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
export const TWELVE_HOURS = 12 * 60 * 60 * 1000;
