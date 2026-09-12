import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import { getSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';
import type { Book, LeaderboardEntry } from '../types';
import { formatPrice, timeRemaining } from '../lib/format';
import TrophyBadge from '../components/TrophyBadge';
import WishlistButton from '../components/WishlistButton';

interface BookResponse {
  book: Book;
  leaderboard: LeaderboardEntry[];
  bidCount: number;
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, openSignIn } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [bidCount, setBidCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bidAmount, setBidAmount] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justBid, setJustBid] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<BookResponse>(`/books/${id}`)
      .then((res) => {
        setBook(res.book);
        setLeaderboard(res.leaderboard);
        setBidCount(res.bidCount);
        setBidAmount(res.book.startingPrice);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    socket.emit('book:join', id);

    // This is a silent/sealed-bid auction: everyone names their own price
    // independently, so someone else's bid should never change what's
    // sitting in this visitor's own bid input — only the displayed
    // current price and leaderboard update live.
    function onUpdate(payload: { bookId: string; currentPrice: number; leaderboard: LeaderboardEntry[]; bidCount: number }) {
      if (payload.bookId !== id) return;
      setBook((prev) => (prev ? { ...prev, currentPrice: payload.currentPrice } : prev));
      setLeaderboard(payload.leaderboard);
      setBidCount(payload.bidCount);
    }
    socket.on('book:update', onUpdate);
    return () => {
      socket.emit('book:leave', id);
      socket.off('book:update', onUpdate);
    };
  }, [id]);

  const quickBids = useMemo(() => {
    if (!book) return [];
    return [1, 2, 3, 4, 5].map((n) => book.startingPrice + book.increment * n);
  }, [book]);

  const belowMin = book !== null && bidAmount !== '' && bidAmount < book.startingPrice;

  async function handleBid(e: FormEvent) {
    e.preventDefault();
    if (!book || !id) return;
    if (!user) {
      openSignIn();
      return;
    }
    setError(null);
    if (bidAmount === '' || bidAmount < book.startingPrice) {
      setError(`Хамгийн багадаа ${formatPrice(book.startingPrice)} байх ёстой`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<BookResponse>(`/books/${id}/bids`, { amount: bidAmount });
      setBook(res.book);
      setLeaderboard(res.leaderboard);
      setBidCount(res.bidCount);
      setJustBid(true);
      setTimeout(() => setJustBid(false), 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Үнэ хэлж чадсангүй');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-24 text-center text-muted">Ном ачааллаж байна…</div>;
  }

  if (notFound || !book) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <p className="text-muted">Энэ ном олдсонгүй.</p>
        <button onClick={() => navigate('/library')} className="mt-4 font-semibold text-accent hover:underline">
          Номын сан руу буцах
        </button>
      </div>
    );
  }

  const ended = book.status === 'ended' || (book.auctionEndsAt ? new Date(book.auctionEndsAt).getTime() < Date.now() : false);

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
      <button onClick={() => navigate(-1)} className="mb-4 shrink-0 text-sm font-semibold text-muted hover:text-accent">
        ← Буцах
      </button>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:min-h-0 lg:flex-1 lg:grid-rows-2">
        {/* Top-left: cover, 1/3 width — shared transition from library grid */}
        <motion.div layoutId={`book-cover-${book.id}`} className="overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-lg md:col-span-1 lg:min-h-0">
          <img src={book.coverImageUrl} alt={book.title} className="aspect-[2/3] w-full object-cover md:aspect-auto md:h-[22rem] lg:h-full" />
        </motion.div>

        {/* Top-right: info, 2/3 width */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative flex flex-col justify-center overflow-y-auto rounded-2xl border border-border bg-surface p-6 md:col-span-2 md:h-[22rem] lg:h-full"
        >
          <WishlistButton bookId={book.id} className="absolute right-4 top-4" />
          <div className="mb-2 flex flex-wrap gap-2 pr-10">
            <span className="w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
              {book.genre}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-fg lg:text-3xl">{book.title}</h1>
          <p className="mt-1 text-sm text-muted">Зохиогч: {book.author}</p>
          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-fg/90 lg:line-clamp-none">{book.summary}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
            <span>{bidCount} удаа үнэ хэлсэн</span>
            {book.auctionEndsAt && <span>{timeRemaining(book.auctionEndsAt)}</span>}
          </div>
        </motion.div>

        {/* Bottom-left: bidding panel, 2/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col justify-center rounded-2xl border border-border bg-surface p-6 md:col-span-2 lg:min-h-0"
        >
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <p className="text-xs text-muted">Эхлэх үнэ</p>
              <p className="text-sm font-semibold text-fg">{formatPrice(book.startingPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Одоогийн үнэ</p>
              <motion.p
                key={book.currentPrice}
                initial={{ scale: 1.15, color: 'rgb(255 122 26)' }}
                animate={{ scale: 1, color: 'inherit' }}
                className="font-display text-2xl font-bold text-accent"
              >
                {formatPrice(book.currentPrice)}
              </motion.p>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {quickBids.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setBidAmount(amount)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  bidAmount === amount
                    ? 'border-accent bg-accent text-accent-fg'
                    : 'border-border text-fg/80 hover:border-accent hover:text-accent'
                }`}
              >
                {formatPrice(amount)}
              </button>
            ))}
          </div>

          {ended ? (
            <p className="rounded-lg bg-surface-2 p-3 text-center text-sm font-semibold text-muted">
              Энэ дуудлага худалдаа дууссан байна.
            </p>
          ) : (
            <form onSubmit={handleBid} className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  min={book.startingPrice}
                  step={book.increment}
                  className={`w-full min-w-0 rounded-lg border bg-bg px-4 py-2.5 text-fg outline-none focus:ring-2 ${
                    belowMin
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
                      : 'border-border focus:border-accent focus:ring-accent/30'
                  }`}
                />
                <motion.button
                  type="submit"
                  disabled={submitting || belowMin}
                  whileTap={{ scale: 0.96 }}
                  className="w-full shrink-0 whitespace-nowrap rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-fg shadow-glow transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? 'Илгээж байна…' : 'Үнэ хэлэх'}
                </motion.button>
              </div>
              {belowMin ? (
                <p className="text-sm text-red-500">
                  Хамгийн багадаа {formatPrice(book.currentPrice + book.increment)} байх ёстой (одоогийн тэргүүлэгчээс их байх ёстой)
                </p>
              ) : (
                error && <p className="text-sm text-red-500">{error}</p>
              )}
              {justBid && <p className="text-sm font-semibold text-emerald-500">Үнэ амжилттай хэлэгдлээ! Та тэргүүлж байна 🎉</p>}
              {!user && <p className="text-xs text-muted">Үнэ хэлэхийн өмнө та нэвтрэх шаардлагатай.</p>}
            </form>
          )}
        </motion.div>

        {/* Bottom-right: leaderboard, 1/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col overflow-y-auto rounded-2xl border border-border bg-surface p-6 md:col-span-1 lg:min-h-0"
        >
          <h2 className="mb-3 shrink-0 font-display text-lg font-bold text-fg">Тэргүүлэгчид</h2>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted">Одоогоор үнэ хэлээгүй байна — эхнийх нь болоорой!</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <TrophyBadge key={entry.rank} entry={entry} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
