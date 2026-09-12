import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import type { Book } from '../types';
import BookCard from '../components/BookCard';
import Footer from '../components/Footer';

export default function Home() {
  const [featured, setFeatured] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ books: Book[] }>('/books?limit=5')
      .then((res) => setFeatured(res.books))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl font-bold leading-[1.15] text-fg sm:text-4xl lg:text-5xl"
            >
              <span className="block">
                Ном бүр өөрийн
                <br />
                гэсэн түүхтэй.
              </span>
              <span className="mt-3 block italic text-accent">Харин энэ удаа түүний үнэ цэнийг та тодорхойлно.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mx-auto mt-3 max-w-xl text-base text-muted sm:text-base lg:mx-0"
            >
              Онцгой номнуудтай танилцаж, өөрийн хүссэн үнээ санал болгоорой. Хамгийн өндөр үнэ санал болгосон оролцогч тухайн номыг эзэмшинэ.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-8 flex items-center justify-center gap-4 lg:justify-start"
            >
              <Link
                to="/library"
                className="rounded-full bg-accent px-7 py-3 font-semibold text-accent-fg shadow-glow transition hover:brightness-110"
              >
                Номын сан руу очих
              </Link>
            </motion.div>
          </div>

          <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
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
                Шууд дуудлага
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

        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">Онцлох номууд</h2>
              <p className="mt-1 text-sm text-muted">Одоо шууд яваа дуудлага худалдаанаас</p>
            </div>
            <Link to="/library" className="whitespace-nowrap text-sm font-semibold text-accent hover:underline">
              Бүгдийг үзэх →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-surface-2" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {featured.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
