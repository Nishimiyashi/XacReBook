import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { formatPrice } from '../lib/format';
import WishlistButton from './WishlistButton';

export default function BookCard({
  book,
  index = 0,
  compact = false,
  myBid,
}: {
  book: Book;
  index?: number;
  compact?: boolean;
  myBid?: number;
}) {
  const navigate = useNavigate();

  return (
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
        <h3
          className={`line-clamp-2 font-display font-semibold leading-tight text-fg ${
            compact ? 'text-xs sm:text-sm' : 'text-base'
          }`}
        >
          {book.title}
        </h3>
        {/* Starting price only here — the live bid price is shown on the book's own detail page */}
        <p className={`font-display font-bold text-accent ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>
          {formatPrice(book.startingPrice)}
        </p>
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
  );
}
