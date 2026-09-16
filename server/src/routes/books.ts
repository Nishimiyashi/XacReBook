import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const booksRouter = Router();

const TROPHIES = ['gold', 'silver', 'bronze'] as const;

async function getLeaderboard(bookId: string) {
  const top = await prisma.bid.groupBy({
    by: ['userId'],
    where: { bookId },
    _max: { amount: true },
    orderBy: { _max: { amount: 'desc' } },
    take: 3,
  });
  if (top.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: top.map((t) => t.userId) } },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));
  return top.map((t, i) => ({
    rank: i + 1,
    trophy: TROPHIES[i],
    name: userMap.get(t.userId)?.name ?? 'Bidder',
    amount: t._max.amount ?? 0,
  }));
}

booksRouter.get('/', async (req, res) => {
  const { genre, origin, minPrice, maxPrice, sort, limit, search } = req.query;

  const where: Record<string, unknown> = { status: { not: 'upcoming' } };
  if (typeof genre === 'string' && genre.length > 0) {
    where.genre = { in: genre.split(',') };
  }
  if (origin === 'mongolian' || origin === 'foreign') {
    where.origin = origin;
  }
  if (typeof search === 'string' && search.trim().length > 0) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { author: { contains: q, mode: 'insensitive' } },
    ];
  }
  const priceFilter: Record<string, number> = {};
  if (typeof minPrice === 'string' && !Number.isNaN(Number(minPrice))) {
    priceFilter.gte = Number(minPrice);
  }
  if (typeof maxPrice === 'string' && !Number.isNaN(Number(maxPrice))) {
    priceFilter.lte = Number(maxPrice);
  }
  if (Object.keys(priceFilter).length > 0) {
    where.currentPrice = priceFilter;
  }

  let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { currentPrice: 'asc' };
  else if (sort === 'price_desc') orderBy = { currentPrice: 'desc' };
  else if (sort === 'ending_soon') orderBy = { auctionEndsAt: 'asc' };

  const take = typeof limit === 'string' && !Number.isNaN(Number(limit)) ? Number(limit) : undefined;

  const books = await prisma.book.findMany({ where, orderBy, take });
  res.json({ books });
});

booksRouter.get('/genres', async (_req, res) => {
  const rows = await prisma.book.findMany({
    distinct: ['genre'],
    select: { genre: true },
    orderBy: { genre: 'asc' },
  });
  res.json({ genres: rows.map((r) => r.genre) });
});

booksRouter.get('/:id', async (req, res) => {
  const book = await prisma.book.findUnique({ where: { id: req.params.id } });
  if (!book || book.status === 'upcoming') {
    return res.status(404).json({ error: 'Book not found' });
  }
  const leaderboard = await getLeaderboard(book.id);
  const bidCount = await prisma.bid.count({ where: { bookId: book.id } });

  let myBid: number | null = null;
  if (req.userId) {
    const mine = await prisma.bid.aggregate({
      where: { bookId: book.id, userId: req.userId },
      _max: { amount: true },
    });
    myBid = mine._max.amount ?? null;
  }

  res.json({ book, leaderboard, bidCount, myBid });
});
