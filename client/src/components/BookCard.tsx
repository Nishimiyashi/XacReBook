import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { formatPrice } from '../lib/format';
import WishlistButton from './WishlistButton';

// 1–3 get an actual medal color; 4–10 stay plain so the podium still stands out.
const RANK_BADGE: Record<number, { ring: string; face: string; text: string }> = {
  1: {
    ring: 'ring-white dark:ring-navy-950',
    face: 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-600',
    text: 'text-amber-950',
  },
  2: {
    ring: 'ring-white dark:ring-navy-950',
    face: 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500',
    text: 'text-slate-800',
  },
  3: {
    ring: 'ring-white dark:ring-navy-950',
    face: 'bg-gradient-to-br from-orange-300 via-orange-500 to-orange-800',
    text: 'text-orange-950',
  },
};

const PLAIN_RANK_BADGE = {
  ring: 'ring-white dark:ring-navy-950',
  face: 'bg-surface border border-border',
  text: 'text-fg/80',
};

export default function BookCard({
  book,
  index = 0,
  compact = false,
  myBid,
  rank,
}: {
  book: Book;
  index?: number;
  compact?: boolean;
  myBid?: number;
  /** 1-based position in the current (usually most-in-demand) ordering — only 1–10 render a badge. */
  rank?: number;
}) {
  const navigate = useNavigate();
  const hasRisen = book.currentPrice > book.startingPrice;
  const medal = rank != null && rank <= 10 ? (RANK_BADGE[rank] ?? PLAIN_RANK_BADGE) : null;

  return (
    <div className="relative h-full">
      {rank != null && medal && (
        // Shield/ribbon silhouette (flat top, pointed bottom) via clip-path — reads as an
        // actual badge hanging off the corner instead of just a rounded-rectangle label.
        <div
          className={`pointer-events-none absolute -left-1.5 -top-1.5 z-20 flex justify-center px-2 pb-3 pt-1.5 shadow-lg ring-2 [clip-path:polygon(0_0,100%_0,100%_68%,50%_100%,0_68%)] ${medal.ring} ${medal.face}`}
        >
          <span className={`whitespace-nowrap font-display text-[10px] font-extrabold uppercase leading-none tracking-wide ${medal.text}`}>
            Топ {rank}
          </span>
        </div>
      )}
      <motion.div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/books/${book.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') navigate(`/books/${book.id}`);
        }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
        whileHover={{ y: -6 }}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-surface text-left shadow-sm outline-none transition-shadow hover:shadow-lg hover:shadow-accent/10 focus-visible:ring-2 focus-visible:ring-accent"
      >
        <motion.div layoutId={`book-cover-${book.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-surface-2">
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <WishlistButton bookId={book.id} size="sm" className="absolute right-1.5 top-1.5" />
        </motion.div>
        <div className={`flex flex-1 flex-col gap-0.5 ${compact ? 'p-2' : 'p-3'}`}>
          {/* min-h reserves 2 lines' worth of space (leading-tight = 1.25 line-height) so a one-line
              title doesn't leave the price sitting higher than it does on cards with a two-line title. */}
          <h3
            className={`line-clamp-2 min-h-[2.5em] font-display font-semibold leading-tight text-fg ${
              compact ? 'text-xs sm:text-sm' : 'text-base'
            }`}
          >
            {book.title}
          </h3>
          {/* Current (live) price leads, with the starting price struck through beside it once bids have moved it up — the full history stays on the book's own detail page. */}
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <p className={`font-display font-bold text-accent ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>
              {formatPrice(book.currentPrice)}
            </p>
            {hasRisen && (
              <p className={`text-muted line-through ${compact ? 'text-[10px]' : 'text-xs'}`}>
                {formatPrice(book.startingPrice)}
              </p>
            )}
          </div>
          {myBid != null && (
            <p
              className={`mt-0.5 truncate text-[11px] font-semibold ${
                myBid >= book.currentPrice ? 'text-emerald-500' : 'text-muted'
              }`}
            >
              Таны санал: {formatPrice(myBid)}
              {myBid >= book.currentPrice ? ' · Тэргүүлж байна' : ' · Давагдсан'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
