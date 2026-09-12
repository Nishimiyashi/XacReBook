import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api';
import type { Book, BookOrigin } from '../types';
import { GENRES } from '../lib/genres';
import BookCard from '../components/BookCard';
import Dropdown from '../components/Dropdown';
import Footer from '../components/Footer';
import { getSocket } from '../lib/socket';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'ending_soon';
type OriginFilter = 'all' | BookOrigin;

const ORIGIN_OPTIONS: { value: OriginFilter; label: string }[] = [
  { value: 'all', label: 'Бүгд' },
  { value: 'mongolian', label: '🇲🇳 Монгол' },
  { value: 'foreign', label: '🌍 Гадаад' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Хамгийн шинэ' },
  { value: 'price_asc', label: 'Үнэ: багаас их рүү' },
  { value: 'price_desc', label: 'Үнэ: ихээс бага руу' },
  { value: 'ending_soon', label: 'Удахгүй дуусах' },
];

const PRICE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Бүх үнэ' },
  { value: '0-10000', label: '0 – 10,000₮' },
  { value: '10000-20000', label: '10,000 – 20,000₮' },
  { value: '20000-30000', label: '20,000 – 30,000₮' },
  { value: '30000-50000', label: '30,000 – 50,000₮' },
  { value: '50000-', label: '50,000₮ +' },
];

function parsePriceRange(range: string): { min?: string; max?: string } {
  if (!range) return {};
  const [min, max] = range.split('-');
  return { min: min || undefined, max: max || undefined };
}

function FilterLabel({ children }: { children: string }) {
  return <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-muted">{children}</p>;
}

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [origin, setOrigin] = useState<OriginFilter>('all');
  const [priceRange, setPriceRange] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (selectedGenres.length) params.set('genre', selectedGenres.join(','));
    if (origin !== 'all') params.set('origin', origin);
    const { min, max } = parsePriceRange(priceRange);
    if (min) params.set('minPrice', min);
    if (max) params.set('maxPrice', max);
    if (sort) params.set('sort', sort);

    const timer = setTimeout(() => {
      api
        .get<{ books: Book[] }>(`/books?${params.toString()}`)
        .then((res) => setBooks(res.books))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedGenres, origin, priceRange, sort]);

  useEffect(() => {
    const socket = getSocket();
    function onPrice({ bookId, currentPrice }: { bookId: string; currentPrice: number }) {
      setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, currentPrice } : b)));
    }
    socket.on('library:price', onPrice);
    return () => {
      socket.off('library:price', onPrice);
    };
  }, []);

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  }

  const hasFilters = useMemo(
    () => selectedGenres.length > 0 || origin !== 'all' || priceRange !== '',
    [selectedGenres, origin, priceRange],
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              showFilters
                ? 'border-accent bg-accent text-accent-fg'
                : 'border-border text-fg/80 hover:border-accent hover:text-accent'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Шүүлтүүр
            {hasFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-fg/20 text-[10px]">
                {selectedGenres.length + (origin !== 'all' ? 1 : 0) + (priceRange ? 1 : 0)}
              </span>
            )}
          </button>

          <div className="relative flex-1 sm:max-w-sm">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ном, зохиогчоор хайх…"
              className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-9 text-sm text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Хайлтыг цэвэрлэх"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="lg:flex lg:items-start">
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-8 w-full overflow-hidden lg:sticky lg:top-20 lg:mb-0 lg:mr-8 lg:w-64 lg:shrink-0"
              >
                <div className="overflow-y-auto rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2 p-5 shadow-sm lg:max-h-[calc(100vh-6rem)]">
                  <div className="mb-5 flex flex-col gap-2.5">
                    {ORIGIN_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 text-sm">
                        <input
                          type="radio"
                          name="origin"
                          checked={origin === opt.value}
                          onChange={() => setOrigin(opt.value)}
                          className="h-4 w-4 accent-accent"
                        />
                        <span className={origin === opt.value ? 'font-semibold text-fg' : 'text-fg/80'}>{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mb-5 border-t border-border pt-5">
                    <FilterLabel>Төрөл</FilterLabel>
                    <div className="flex flex-col gap-2.5">
                      {GENRES.map((genre) => (
                        <label key={genre} className="flex cursor-pointer items-center gap-2.5 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre)}
                            onChange={() => toggleGenre(genre)}
                            className="h-4 w-4 rounded accent-accent"
                          />
                          <span className={selectedGenres.includes(genre) ? 'font-semibold text-fg' : 'text-fg/80'}>
                            {genre}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5 border-t border-border pt-5">
                    <FilterLabel>Үнэ</FilterLabel>
                    <Dropdown value={priceRange} options={PRICE_OPTIONS} onChange={setPriceRange} />
                  </div>

                  <div className="border-t border-border pt-5">
                    <FilterLabel>Эрэмбэлэх</FilterLabel>
                    <Dropdown value={sort} options={SORT_OPTIONS} onChange={setSort} />
                  </div>

                  {hasFilters && (
                    <button
                      onClick={() => {
                        setSelectedGenres([]);
                        setOrigin('all');
                        setPriceRange('');
                      }}
                      className="mt-5 w-full text-center text-xs font-semibold text-muted hover:text-accent"
                    >
                      Шүүлтүүр цэвэрлэх ✕
                    </button>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-surface-2" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <p className="py-20 text-center text-muted">
                {search
                  ? `"${search}" гэсэн хайлтад тохирох ном олдсонгүй.`
                  : 'Таны шүүлтүүрт тохирох ном олдсонгүй.'}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
                {books.map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
