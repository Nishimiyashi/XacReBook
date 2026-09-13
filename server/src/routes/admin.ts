import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signAdminToken } from '../lib/jwt.js';
import { cookieOptions, TWELVE_HOURS } from '../lib/cookies.js';
import { ADMIN_COOKIE, requireAdmin } from '../middleware/auth.js';
import { UPLOADS_DIR } from '../lib/uploads.js';

export const adminRouter = Router();

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

adminRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Хэрэглэгчийн нэр, нууц үгээ оруулна уу' });
  }
  const { username, password } = parsed.data;
  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ error: 'Нэвтрэх мэдээлэл буруу байна' });
  }
  const token = signAdminToken(admin.id);
  res.cookie(ADMIN_COOKIE, token, cookieOptions(TWELVE_HOURS));
  res.json({ admin: { id: admin.id, username: admin.username } });
});

adminRouter.get('/me', requireAdmin, async (req, res) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.adminId } });
  if (!admin) return res.status(401).json({ error: 'Нэвтрээгүй байна' });
  res.json({ admin: { id: admin.id, username: admin.username } });
});

adminRouter.post('/logout', (_req, res) => {
  res.clearCookie(ADMIN_COOKIE, { path: '/' });
  res.json({ ok: true });
});

adminRouter.get('/books', requireAdmin, async (_req, res) => {
  const books = await prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ books });
});

const bookSchema = z.object({
  title: z.string().trim().min(1, 'Гарчиг оруулна уу'),
  author: z.string().trim().min(1, 'Зохиогчийг оруулна уу'),
  summary: z.string().trim().min(1, 'Тойм оруулна уу'),
  genre: z.string().trim().min(1, 'Төрлийг оруулна уу'),
  origin: z.enum(['mongolian', 'foreign'], { errorMap: () => ({ message: 'Гарал үүслийг сонгоно уу' }) }),
  coverImageUrl: z.string().trim().min(1, 'Нүүр зураг оруулна уу'),
  startingPrice: z.number().int().positive('Эхлэх үнэ эерэг тоо байх ёстой'),
  increment: z.number().int().positive('Нэмэгдэх алхам эерэг тоо байх ёстой'),
  auctionEndsAt: z.string().datetime('Дуусах хугацаа буруу байна').nullable().optional(),
  status: z.enum(['upcoming', 'live', 'ended']).default('live'),
});

adminRouter.post('/books', requireAdmin, async (req, res) => {
  const parsed = bookSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Номын мэдээлэл буруу байна' });
  }
  const data = parsed.data;
  const book = await prisma.book.create({
    data: {
      title: data.title,
      author: data.author,
      summary: data.summary,
      genre: data.genre,
      origin: data.origin,
      coverImageUrl: data.coverImageUrl,
      startingPrice: data.startingPrice,
      increment: data.increment,
      currentPrice: data.startingPrice,
      auctionEndsAt: data.auctionEndsAt ? new Date(data.auctionEndsAt) : null,
      status: data.status,
    },
  });
  res.status(201).json({ book });
});

adminRouter.put('/books/:id', requireAdmin, async (req, res) => {
  const parsed = bookSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Номын мэдээлэл буруу байна' });
  }
  const data = parsed.data;
  try {
    const book = await prisma.book.update({
      where: { id: req.params.id },
      data: {
        ...data,
        auctionEndsAt: data.auctionEndsAt === undefined ? undefined : data.auctionEndsAt ? new Date(data.auctionEndsAt) : null,
      },
    });
    res.json({ book });
  } catch {
    res.status(404).json({ error: 'Ном олдсонгүй' });
  }
});

adminRouter.delete('/books/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.book.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Ном олдсонгүй' });
  }
});

adminRouter.get('/books/:id/bids', requireAdmin, async (req, res) => {
  const bids = await prisma.bid.findMany({
    where: { bookId: req.params.id },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    bids: bids.map((b) => ({
      id: b.id,
      amount: b.amount,
      createdAt: b.createdAt,
      userName: b.user.name,
      userPhone: b.user.phone,
    })),
  });
});

// Every distinct bidder on this book, ranked by their highest bid — for
// calling down the list (highest first) to confirm the sale if the winner
// backs out.
adminRouter.get('/books/:id/bidders', requireAdmin, async (req, res) => {
  const bookId = req.params.id;
  const grouped = await prisma.bid.groupBy({
    by: ['userId'],
    where: { bookId },
    _max: { amount: true },
    orderBy: { _max: { amount: 'desc' } },
  });
  const users = await prisma.user.findMany({ where: { id: { in: grouped.map((g) => g.userId) } } });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const lastBids = await prisma.bid.findMany({
    where: { bookId },
    orderBy: { createdAt: 'desc' },
    distinct: ['userId'],
  });
  const lastBidTimeMap = new Map(lastBids.map((b) => [b.userId, b.createdAt]));

  res.json({
    bidders: grouped.map((g, i) => ({
      rank: i + 1,
      userId: g.userId,
      name: userMap.get(g.userId)?.name ?? 'Тэргүүлэгч',
      phone: userMap.get(g.userId)?.phone ?? '',
      amount: g._max.amount ?? 0,
      lastBidAt: lastBidTimeMap.get(g.userId) ?? null,
    })),
  });
});

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Зөвхөн зураг байршуулах боломжтой'));
      return;
    }
    cb(null, true);
  },
});

adminRouter.post('/upload', requireAdmin, upload.single('cover'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл байршуулаагүй байна' });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
