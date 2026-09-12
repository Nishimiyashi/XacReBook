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
        <section className="text-center">
          <motion.img
            src="/mascot.png"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-2 h-24 w-24 animate-float-slow sm:h-32 sm:w-32"
          />
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent"
          >
            Шууд дуудлага худалдаа · Үнэ хэлж эзэмш
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl font-bold leading-tight text-fg sm:text-6xl"
          >
            Ном бүр өөрийн гэсэн түүхтэй.
            <br />
            <span className="text-accent">Таны түүх үнэ хэлснээр эхэлнэ.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg"
          >
            Цуглуулгыг чөлөөтэй үзээрэй — үнэ хэлэхэд бэлэн болмогц нэвтэрнэ үү. Хамгийн өндөр үнэ хэлсэн хүн
            номыг авна.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <Link
              to="/library"
              className="rounded-full bg-accent px-7 py-3 font-semibold text-accent-fg shadow-glow transition hover:brightness-110"
            >
              Номын сан руу очих
            </Link>
          </motion.div>
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
