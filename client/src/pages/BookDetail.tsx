import { useEffect, useState, type FormEvent } from 'react';
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
  myBid: number | null;
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
  const [myBid, setMyBid] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

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
        setMyBid(res.myBid);
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
      setMyBid(res.myBid);
      setJustBid(true);
      setTimeout(() => setJustBid(false), 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Үнэ хэлж чадсангүй');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!book || !id) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await api.delete<BookResponse>(`/books/${id}/bids`);
      setBook(res.book);
      setLeaderboard(res.leaderboard);
      setBidCount(res.bidCount);
      setMyBid(res.myBid);
      setBidAmount(res.book.startingPrice);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Цуцалж чадсангүй');
    } finally {
      setCancelling(false);
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
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6 lg:h-[min(calc(100vh-4rem),50rem)] lg:overflow-hidden">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm font-semibold text-muted hover:text-accent">
        ← Буцах
      </button>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:min-h-0 lg:flex-1 lg:grid-rows-[minmax(0,1fr)_18rem]">
        {/* Top-left: cover, 1/3 width — shared transition from library grid */}
        <motion.div layoutId={`book-cover-${book.id}`} className="overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-lg md:col-span-1 lg:min-h-0">
          <img src={book.coverImageUrl} alt={book.title} className="aspect-[2/3] w-full object-cover md:aspect-auto md:h-[22rem] lg:h-full" />
        </motion.div>

        {/* Top-right: info, 2/3 width */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative flex flex-col justify-center overflow-y-auto rounded-2xl border border-border bg-surface p-6 md:col-span-2 md:h-[22rem] md:justify-start lg:h-full"
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
          className="flex flex-col rounded-2xl border border-border bg-surface p-6 md:col-span-2 lg:min-h-0"
        >
          <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3 border-b border-border pb-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted">Дуудах үнэ</p>
              <p className="text-sm font-semibold text-fg">{formatPrice(book.startingPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Зах зээлийн үнэ</p>
              <p className="text-sm font-semibold text-fg">{formatPrice(book.marketPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Эдэлгээ</p>
              <p className="text-sm font-semibold text-fg">{book.condition}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Одоогийн үнэ</p>
              <motion.p
                key={book.currentPrice}
                initial={{ scale: 1.15, color: 'rgb(255 122 26)' }}
                animate={{ scale: 1, color: 'inherit' }}
                className="font-display text-xl font-bold text-accent"
              >
                {formatPrice(book.currentPrice)}
              </motion.p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center">
            {ended ? (
              <p className="rounded-lg bg-surface-2 p-3 text-center text-sm font-semibold text-muted">
                Энэ номын худалдаа дууссан байна.
              </p>
            ) : (
              <div className="flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-start">
                <form onSubmit={handleBid} className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      min={book.startingPrice}
                      step={1}
                      className={`h-11 w-full min-w-0 rounded-lg border bg-bg px-4 text-fg outline-none focus:ring-2 ${
                        belowMin
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
                          : 'border-border focus:border-accent focus:ring-accent/30'
                      }`}
                    />
                    <motion.button
                      type="submit"
                      disabled={submitting || belowMin}
                      whileTap={{ scale: 0.96 }}
                      className="flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-accent px-5 font-semibold text-accent-fg shadow-glow transition hover:brightness-110 disabled:opacity-60"
                    >
                      {submitting ? 'Илгээж байна…' : 'Үнэ хэлэх'}
                    </motion.button>
                  </div>
                  {belowMin ? (
                    <p className="text-sm text-red-500">Хамгийн багадаа {formatPrice(book.startingPrice)} байх ёстой</p>
                  ) : (
                    error && <p className="text-sm text-red-500">{error}</p>
                  )}
                  {justBid && <p className="text-sm font-semibold text-emerald-500">Үнэ амжилттай хэлэгдлээ! Та тэргүүлж байна 🎉</p>}
                  {!user && <p className="text-xs text-muted">Үнэ санал болгохын тулд нэвтэрнэ үү.</p>}
                </form>
                {myBid !== null && (
                  <div className="flex h-11 flex-1 items-center justify-between gap-3 whitespace-nowrap rounded-lg bg-surface-2 px-4 text-sm">
                    <span className="text-fg">
                      Таны санал: <span className="font-semibold text-accent">{formatPrice(myBid)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="shrink-0 text-xs font-semibold text-red-500 hover:underline disabled:opacity-60"
                    >
                      {cancelling ? 'Цуцалж байна…' : 'Цуцлах'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom-right: leaderboard, 1/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col overflow-y-auto rounded-2xl border border-border bg-surface p-6 md:col-span-1 lg:min-h-0"
        >
          <h2 className="mb-3 shrink-0 font-display text-lg font-bold text-fg">Өрсөлдөгчид</h2>
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
