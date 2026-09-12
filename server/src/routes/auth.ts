import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signUserToken } from '../lib/jwt.js';
import { cookieOptions, SEVEN_DAYS } from '../lib/cookies.js';
import { USER_COOKIE } from '../middleware/auth.js';

export const authRouter = Router();

const signInSchema = z.object({
  name: z.string().trim().min(2, 'Нэр хэтэрхий богино байна').max(60),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+][0-9 ()-]{5,19}$/, 'Утасны дугаараа зөв оруулна уу'),
});

authRouter.post('/signin', async (req, res) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Буруу мэдээлэл' });
  }
  const { name, phone } = parsed.data;

  const user = await prisma.user.upsert({
    where: { phone },
    update: { name },
    create: { name, phone },
  });

  const token = signUserToken(user.id);
  res.cookie(USER_COOKIE, token, cookieOptions(SEVEN_DAYS));
  res.json({ user: { id: user.id, name: user.name, phone: user.phone } });
});

authRouter.get('/me', async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Нэвтрээгүй байна' });
  }
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(401).json({ error: 'Нэвтрээгүй байна' });
  }
  res.json({ user: { id: user.id, name: user.name, phone: user.phone } });
});

authRouter.post('/signout', (_req, res) => {
  res.clearCookie(USER_COOKIE, { path: '/' });
  res.json({ ok: true });
});
