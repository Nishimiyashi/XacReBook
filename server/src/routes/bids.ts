import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import type { Server as SocketServer } from 'socket.io';
import type { Book, BookStatus } from '@prisma/client';

export const bidsRouter = Router();

const bidLimiter = rateLimit({
  windowMs: 10_000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Хэт олон удаа үнэ хэлж байна — түр хүлээгээд дахин оролдоно уу.' },
  // Key by signed-in user, not IP: at a live event many attendees share one
  // venue WiFi NAT, so an IP-keyed limit would lump unrelated bidders
  // together and could lock out everyone behind that IP. requireAuth runs
  // before this middleware, so req.userId is always set here.
  keyGenerator: (req) => req.userId ?? req.ip ?? 'unknown',
});

const bidSchema = z.object({
  amount: z.number().int().positive(),
});

type BookRow = {
  id: string;
  startingPrice: number;
  currentPrice: number;
  increment: number;
  status: BookStatus;
  auctionEndsAt: Date | null;
};

const TROPHIES = ['gold', 'silver', 'bronze'] as const;

async function buildLeaderboard(bookId: string) {
  const top = await prisma.bid.groupBy({
    by: ['userId'],
    where: { bookId },
    _max: { amount: true },
    orderBy: { _max: { amount: 'desc' } },
    take: 3,
  });
  const users = await prisma.user.findMany({ where: { id: { in: top.map((t) => t.userId) } } });
  const userMap = new Map(users.map((u) => [u.id, u]));
  return top.map((t, i) => ({
    rank: i + 1,
    trophy: TROPHIES[i],
    name: userMap.get(t.userId)?.name ?? 'Тэргүүлэгч',
    amount: t._max.amount ?? 0,
  }));
}

bidsRouter.post('/:id/bids', requireAuth, bidLimiter, async (req, res) => {
  const parsed = bidSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Зөв дүн оруулна уу' });
  }
  const bookId = req.params.id;
  const userId = req.userId!;
  const { amount } = parsed.data;

  type BidResult =
    | { ok: false; error: 'not_found' | 'not_live' | 'ended' }
    | { ok: false; error: 'too_low'; minAmount: number }
    | { ok: true; book: Book };

  try {
    const result: BidResult = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<BookRow[]>`
        SELECT id, "startingPrice", "currentPrice", increment, status, "auctionEndsAt"
        FROM "Book" WHERE id = ${bookId} FOR UPDATE
      `;
      const book = rows[0];
      if (!book) {
        return { ok: false, error: 'not_found' };
      }
      if (book.status !== 'live') {
        return { ok: false, error: 'not_live' };
      }
      if (book.auctionEndsAt && book.auctionEndsAt.getTime() < Date.now()) {
        return { ok: false, error: 'ended' };
      }
      // This is a silent/sealed-bid auction, not a sequential "must outbid
      // the leader" one: each bidder names their own price independently
      // (like a charity bid sheet), so the only floor is the starting
      // price — a bid lower than the current leader is allowed on purpose.
      if (amount < book.startingPrice) {
        return { ok: false, error: 'too_low', minAmount: book.startingPrice };
      }

      await tx.bid.create({ data: { bookId, userId, amount } });
      const updated = await tx.book.update({
        where: { id: bookId },
        data: { currentPrice: Math.max(book.currentPrice, amount) },
      });
      return { ok: true, book: updated };
    });

    if (!result.ok) {
      const messages: Record<string, string> = {
        not_found: 'Ном олдсонгүй',
        not_live: 'Энэ дуудлага худалдаа явагдахгүй байна',
        ended: 'Энэ дуудлага худалдаа дууссан байна',
        too_low: `Эхлэх үнэ буюу ${'minAmount' in result ? result.minAmount.toLocaleString('en-US') : ''}₮-с багагүй байх ёстой`.trim(),
      };
      return res.status(400).json({ error: messages[result.error] });
    }

    const leaderboard = await buildLeaderboard(bookId);
    const bidCount = await prisma.bid.count({ where: { bookId } });

    const io = req.app.get('io') as SocketServer;
    io.to(`book:${bookId}`).emit('book:update', {
      bookId,
      currentPrice: result.book.currentPrice,
      leaderboard,
      bidCount,
    });
    io.to('library').emit('library:price', { bookId, currentPrice: result.book.currentPrice });

    res.json({ book: result.book, leaderboard, bidCount });
  } catch (err) {
    console.error('Bid failed', err);
    res.status(500).json({ error: 'Үнэ хэлж чадсангүй, дахин оролдоно уу' });
  }
});
