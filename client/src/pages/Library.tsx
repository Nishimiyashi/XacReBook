import { Children, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api';
import type { Book, BookOrigin } from '../types';
import { useGenres } from '../lib/genres';
import BookCard from '../components/BookCard';
import Footer from '../components/Footer';
import { getSocket } from '../lib/socket';

type SortOption = 'most_bid' | 'most_wishlisted' | 'newest' | 'price_asc' | 'price_desc' | 'ending_soon';
type OriginFilter = 'all' | BookOrigin;

const ORIGIN_OPTIONS: { value: OriginFilter; label: string }[] = [
  { value: 'all', label: 'Бүгд' },
  { value: 'mongolian', label: '🇲🇳 Монгол' },
  { value: 'foreign', label: '🌍 Гадаад' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'most_bid', label: 'Хамгийн эрэлттэй' },
  { value: 'most_wishlisted', label: 'Хамгийн их хадгалагдсан' },
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

type SectionKey = 'origin' | 'genre' | 'price' | 'sort';

const SECTION_ICONS: Record<SectionKey, ReactNode> = {
  origin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.4 2.5 3.8 5.7 3.8 9s-1.4 6.5-3.8 9c-2.4-2.5-3.8-5.7-3.8-9s1.4-6.5 3.8-9z" />
    </>
  ),
  genre: (
    <>
      <path d="M12.6 3.3H5.4a1 1 0 0 0-1 1v7.2a1 1 0 0 0 .3.7l9 9a1 1 0 0 0 1.4 0l7.2-7.2a1 1 0 0 0 0-1.4l-9-9a1 1 0 0 0-.3-.3z" />
      <circle cx="8.5" cy="8.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  price: (
    <>
      <circle cx="8.5" cy="9.5" r="5" />
      <circle cx="15.5" cy="14.5" r="5" />
    </>
  ),
  sort: (
    <>
      <path d="M7 4v16" />
      <path d="M4 7l3-3 3 3" />
      <path d="M17 20V4" />
      <path d="M20 17l-3 3-3-3" />
    </>
  ),
};

function SectionIcon({ name }: { name: SectionKey }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted"
    >
      {SECTION_ICONS[name]}
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
      {count}
    </span>
  );
}

function ActiveDot({ active }: { active: boolean }) {
  if (!active) return null;
  return <span className="h-1.5 w-1.5 rounded-full bg-accent" />;
}

const ROW_H = 36;

const CONNECTOR_LEAD_IN = 8;

function TreeConnector({ count }: { count: number }) {
  const height = CONNECTOR_LEAD_IN + count * ROW_H;
  let d = 'M1 0';
  for (let i = 0; i < count; i++) {
    const cy = CONNECTOR_LEAD_IN + i * ROW_H + ROW_H / 2;
    d += ` L1 ${cy - 8} Q1 ${cy} 10 ${cy}`;
    if (i < count - 1) d += ` M1 ${cy}`;
  }
  return (
    <svg
      width="16"
      height={height}
      viewBox={`0 0 16 ${height}`}
      className="pointer-events-none absolute -top-2 left-0 text-border"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d={d} />
    </svg>
  );
}

function FilterSection({
  icon,
  label,
  badge,
  open,
  onToggle,
  children,
}: {
  icon: SectionKey;
  label: string;
  badge?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <SectionIcon name={icon} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted">{label}</span>
        </span>
        <div className="flex items-center gap-2">
          {badge}
          <ChevronIcon open={open} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="relative mt-2">
              <TreeConnector count={Children.count(children)} />
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TreeItem({
  active,
  onClick,
  layoutId,
  children,
}: {
  active: boolean;
  onClick: () => void;
  layoutId?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative h-9">
      <button
        type="button"
        onClick={onClick}
        className={`relative ml-4 flex h-9 w-[calc(100%-1rem)] items-center gap-2 rounded-lg px-2 text-left text-sm transition-colors ${
          active ? 'font-semibold text-fg' : 'text-fg/70 hover:bg-surface-2/60 hover:text-fg'
        }`}
      >
        {active &&
          (layoutId ? (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg bg-surface-2"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
            />
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 rounded-lg bg-surface-2"
            />
          ))}
        <span className="relative">{children}</span>
      </button>
    </div>
  );
}

interface LibraryCache {
  books: Book[];
  total: number | null;
  search: string;
  selectedGenres: string[];
  origin: OriginFilter;
  priceRange: string;
  sort: SortOption;
  showFilters: boolean;
  openSections: Record<SectionKey, boolean>;
}

// Survives leaving the page (e.g. opening a book), so tapping back shows the
// same books and filters instantly — which is also what lets the scroll
// position be restored, since the page is already full height on return.
let libraryCache: LibraryCache | null = null;

export default function Library() {
  const genres = useGenres();
  const [books, setBooks] = useState<Book[]>(libraryCache?.books ?? []);
  const [search, setSearch] = useState(libraryCache?.search ?? '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(libraryCache?.selectedGenres ?? []);
  const [origin, setOrigin] = useState<OriginFilter>(libraryCache?.origin ?? 'all');
  const [priceRange, setPriceRange] = useState(libraryCache?.priceRange ?? '');
  const [sort, setSort] = useState<SortOption>(libraryCache?.sort ?? 'most_bid');
  const [total, setTotal] = useState<number | null>(libraryCache?.total ?? null);
  const [loading, setLoading] = useState(!libraryCache);
  const [showFilters, setShowFilters] = useState(libraryCache?.showFilters ?? false);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    libraryCache?.openSections ?? {
      origin: false,
      genre: true,
      price: false,
      sort: false,
    },
  );
  const silentRefresh = useRef(Boolean(libraryCache));

  useEffect(() => {
    libraryCache = { books, total, search, selectedGenres, origin, priceRange, sort, showFilters, openSections };
  }, [books, total, search, selectedGenres, origin, priceRange, sort, showFilters, openSections]);

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  useEffect(() => {
    if (!silentRefresh.current) setLoading(true);
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
        .get<{ books: Book[]; total: number }>(`/books?${params.toString()}`)
        .then((res) => {
          setBooks(res.books);
          setTotal(res.total);
        })
        .finally(() => {
          silentRefresh.current = false;
          setLoading(false);
        });
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
                : 'border-border bg-surface text-fg/80 hover:border-accent hover:text-accent'
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

          <div className="order-first flex sm:order-none">
            <span className="flex w-full items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent sm:inline-flex sm:w-auto sm:py-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2" />
                <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H19v-3" />
              </svg>
              {total != null ? (
                <>
                  Нийт <span className="font-display text-base font-bold">{total}</span> ном
                </>
              ) : (
                'Ачааллаж байна…'
              )}
            </span>
          </div>

          <div className="relative w-full sm:ml-auto sm:w-auto sm:max-w-sm">
            <img
              src="/search.png"
              alt=""
              className="pointer-events-none absolute left-1.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full object-cover"
            />
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
                <div className="space-y-4 overflow-y-auto rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2 p-5 shadow-sm lg:max-h-[calc(100vh-6rem)]">
                  <FilterSection
                    icon="origin"
                    label="Гарал үүсэл"
                    badge={<ActiveDot active={origin !== 'all'} />}
                    open={openSections.origin}
                    onToggle={() => toggleSection('origin')}
                  >
                    {ORIGIN_OPTIONS.map((opt) => (
                      <TreeItem
                        key={opt.value}
                        active={origin === opt.value}
                        onClick={() => setOrigin(opt.value)}
                        layoutId="origin-active"
                      >
                        {opt.label}
                      </TreeItem>
                    ))}
                  </FilterSection>

                  <FilterSection
                    icon="genre"
                    label="Төрөл"
                    badge={<CountBadge count={selectedGenres.length} />}
                    open={openSections.genre}
                    onToggle={() => toggleSection('genre')}
                  >
                    {genres.map((genre) => (
                      <TreeItem
                        key={genre}
                        active={selectedGenres.includes(genre)}
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </TreeItem>
                    ))}
                  </FilterSection>

                  <FilterSection
                    icon="price"
                    label="Үнэ"
                    badge={<ActiveDot active={priceRange !== ''} />}
                    open={openSections.price}
                    onToggle={() => toggleSection('price')}
                  >
                    {PRICE_OPTIONS.map((opt) => (
                      <TreeItem
                        key={opt.value}
                        active={priceRange === opt.value}
                        onClick={() => setPriceRange(opt.value)}
                        layoutId="price-active"
                      >
                        {opt.label}
                      </TreeItem>
                    ))}
                  </FilterSection>

                  <FilterSection
                    icon="sort"
                    label="Эрэмбэлэх"
                    open={openSections.sort}
                    onToggle={() => toggleSection('sort')}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <TreeItem
                        key={opt.value}
                        active={sort === opt.value}
                        onClick={() => setSort(opt.value)}
                        layoutId="sort-active"
                      >
                        {opt.label}
                      </TreeItem>
                    ))}
                  </FilterSection>

                  {hasFilters && (
                    <button
                      onClick={() => {
                        setSelectedGenres([]);
                        setOrigin('all');
                        setPriceRange('');
                      }}
                      className="w-full border-t border-border pt-4 text-center text-xs font-semibold text-muted hover:text-accent"
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
