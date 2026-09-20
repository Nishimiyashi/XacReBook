import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

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

  // Default (no explicit sort, e.g. the homepage's "featured" strip) surfaces
  // the most in-demand books first rather than just the newest ones.
  const mostBidOrder = [{ bids: { _count: 'desc' } }, { createdAt: 'desc' }];

  let orderBy: object = mostBidOrder;
  if (sort === 'newest') orderBy = { createdAt: 'desc' };
  else if (sort === 'price_asc') orderBy = { currentPrice: 'asc' };
  else if (sort === 'price_desc') orderBy = { currentPrice: 'desc' };
  else if (sort === 'ending_soon') orderBy = { auctionEndsAt: 'asc' };
  else if (sort === 'most_bid') orderBy = mostBidOrder;
  else if (sort === 'most_wishlisted') orderBy = [{ wishlistedBy: { _count: 'desc' } }, { createdAt: 'desc' }];

  const take = typeof limit === 'string' && !Number.isNaN(Number(limit)) ? Number(limit) : undefined;

  const books = await prisma.book.findMany({ where, orderBy, take });
  const total = await prisma.book.count({ where });
  res.json({ books, total });
});

booksRouter.get('/genres', async (_req, res) => {
  const rows = await prisma.book.findMany({
    distinct: ['genre'],
    select: { genre: true },
    orderBy: { genre: 'asc' },
  });
  res.json({ genres: rows.map((r) => r.genre) });
});

// Books this user has placed a bid on, most recently bid on first — shown
// alongside the wishlist so a bidder can find their own standing offers.
booksRouter.get('/mine/bids', requireAuth, async (req, res) => {
  const userId = req.userId!;

  const grouped = await prisma.bid.groupBy({
    by: ['bookId'],
    where: { userId },
    _max: { amount: true, createdAt: true },
  });
  if (grouped.length === 0) return res.json({ books: [] });

  const books = await prisma.book.findMany({ where: { id: { in: grouped.map((g) => g.bookId) } } });
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const results = grouped
    .map((g) => ({ book: bookMap.get(g.bookId), myBid: g._max.amount ?? 0, lastBidAt: g._max.createdAt }))
    .filter((r): r is { book: NonNullable<typeof r.book>; myBid: number; lastBidAt: Date | null } => Boolean(r.book))
    .sort((a, b) => (b.lastBidAt?.getTime() ?? 0) - (a.lastBidAt?.getTime() ?? 0));

  res.json({ books: results.map((r) => ({ ...r.book, myBid: r.myBid })) });
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
