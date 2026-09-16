import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import type { Book } from '../types';
import BookCard from '../components/BookCard';
import Footer from '../components/Footer';

// Chromium hijacks a plain vertical wheel gesture into horizontal scroll on
// any element with overflow-x but no overflow-y — so scrolling the page
// while the cursor happens to be over this row eats the first tick or two
// instead of moving the page. Force vertical wheel input to always scroll
// the page; only a genuinely horizontal gesture (trackpad swipe, shift+wheel)
// scrolls the row itself. React's onWheel is passive by default, so
// preventDefault() there silently no-ops — this needs a real, non-passive
// DOM listener, attached via a callback ref since the row mounts/unmounts
// as `loading` flips.
function onCarouselWheel(e: globalThis.WheelEvent) {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    window.scrollBy({ top: e.deltaY });
  }
}

function useCarouselWheelFix() {
  const cleanup = useRef<() => void>();
  return useCallback((el: HTMLDivElement | null) => {
    cleanup.current?.();
    if (!el) return;
    el.addEventListener('wheel', onCarouselWheel, { passive: false });
    cleanup.current = () => el.removeEventListener('wheel', onCarouselWheel);
  }, []);
}

export default function Home() {
  const [featured, setFeatured] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useCarouselWheelFix();

  useEffect(() => {
    api
      .get<{ books: Book[] }>('/books?limit=8')
      .then((res) => setFeatured(res.books))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="order-2 text-center lg:order-none lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-2xl font-bold leading-[1.15] text-fg sm:text-4xl lg:text-5xl"
            >
              <span className="block">
                Ном бүр өөрийн
                <br />
                түүхтэй.
              </span>
              <span className="mt-3 block italic text-accent">Харин энэ удаа түүний ертөнцөөр та аялана.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base lg:mx-0"
            >
              Таны сонирхсон ном энд байж магадгүй тул таалагдсан номоо сонгоод, өөрийн санал болгох үнээр номын худалдаанд оролцоорой.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-6 flex items-center justify-center gap-4 sm:mt-8 lg:justify-start"
            >
              <Link
                to="/library"
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-glow transition hover:brightness-110 sm:px-7 sm:py-3 sm:text-base"
              >
                Номын сан руу очих
              </Link>
            </motion.div>
          </div>

          <div className="relative order-1 mx-auto flex h-64 w-64 items-center justify-center lg:order-none sm:h-80 sm:w-80">
            <div className="relative flex h-full w-full animate-float-slow items-center justify-center">
              <motion.img
                src="/mascot.png"
                alt=""
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.8, scaleX: -1 }}
                animate={{ opacity: 1, scale: 1, scaleX: -1 }}
                className="h-32 w-32 sm:h-40 sm:w-40"
              />

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="absolute -top-2 left-1/2 w-max max-w-[10.5rem] -translate-x-1/2 rounded-2xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-fg shadow-glow sm:max-w-[15rem] sm:text-sm"
              >
                Хамгийн өндөр үнэ хэлсэн нь ялна!
                <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-accent" />
              </motion.div>

              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute right-0 top-16 rounded-full bg-fg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-bg shadow-lg sm:right-2 sm:top-20"
              >
                Шууд худалдаа
              </motion.span>

              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-4 left-0 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent sm:bottom-8 sm:left-2"
              >
                Нэг ном нэг боломж
              </motion.span>
            </div>
          </div>
        </section>

        <section className="mt-4 lg:mt-0">
          <div className="mb-6 lg:text-right">
            <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">Онцлох номууд</h2>
            <p className="mt-1 text-sm text-muted">Яг одоо эзнээ хүлээж буй номууд</p>
          </div>

          {loading ? (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-surface-2" />
                ))}
              </div>
              <div ref={carouselRef} className="hidden gap-4 overflow-hidden lg:flex">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] w-44 shrink-0 animate-pulse rounded-xl bg-surface-2" />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:hidden">
                {featured.slice(0, 6).map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))}
              </div>
              <Link
                to="/library"
                className="mt-4 flex items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold text-accent transition hover:border-accent hover:bg-surface-2 lg:hidden"
              >
                Бүгдийг үзэх
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </Link>
              <div className="relative hidden lg:block">
                <div ref={carouselRef} className="scrollbar-hide flex gap-4 overflow-x-auto">
                  {featured.map((book, i) => (
                    <div key={book.id} className="w-44 shrink-0">
                      <BookCard book={book} index={i} />
                    </div>
                  ))}
                  <Link
                    to="/library"
                    className="flex aspect-[2/3] w-44 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-semibold text-accent transition hover:border-accent hover:bg-surface-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                    Бүгдийг үзэх
                  </Link>
                </div>
                {/* fade hints that the row scrolls — otherwise the last card just looks clipped */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-bg to-transparent" />
              </div>
            </>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
