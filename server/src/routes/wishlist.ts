import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);

wishlistRouter.get('/', async (req, res) => {
  const rows = await prisma.wishlist.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    include: { book: true },
  });
  res.json({ books: rows.map((r) => r.book) });
});

wishlistRouter.post('/:bookId', async (req, res) => {
  const { bookId } = req.params;
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return res.status(404).json({ error: 'Ном олдсонгүй' });
  }
  await prisma.wishlist.upsert({
    where: { userId_bookId: { userId: req.userId!, bookId } },
    update: {},
    create: { userId: req.userId!, bookId },
  });
  res.status(201).json({ ok: true });
});

wishlistRouter.delete('/:bookId', async (req, res) => {
  await prisma.wishlist.deleteMany({
    where: { userId: req.userId!, bookId: req.params.bookId },
  });
  res.json({ ok: true });
});
