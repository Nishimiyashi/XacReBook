import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../lib/api';
import type { MyBidBook } from '../types';
import BookCard from '../components/BookCard';
import Footer from '../components/Footer';

type Tab = 'saved' | 'bids';

export default function Wishlist() {
  const { user, loading: authLoading, openSignIn } = useAuth();
  const { books, loading } = useWishlist();

  const [tab, setTab] = useState<Tab>('saved');
  const [bidBooks, setBidBooks] = useState<MyBidBook[]>([]);
  const [bidsLoading, setBidsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setBidsLoading(true);
    api
      .get<{ books: MyBidBook[] }>('/books/mine/bids')
      .then((res) => setBidBooks(res.books))
      .catch(() => setBidBooks([]))
      .finally(() => setBidsLoading(false));
  }, [user]);

  if (authLoading || (user && loading)) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted">Ачааллаж байна…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <img src="/mascot.png" alt="" aria-hidden="true" className="mb-4 h-24 w-24 opacity-80" />
        <h1 className="font-display text-2xl font-bold text-fg">Хадгалсан номоо харахын тулд нэвтэрнэ үү</h1>
        <p className="mt-2 text-sm text-muted">Дуртай номоо хадгалж, дараа нь буцаж ирж үзээрэй.</p>
        <button
          onClick={openSignIn}
          className="mt-6 rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-fg shadow-glow transition hover:brightness-110"
        >
          Нэвтрэх
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-fg sm:text-3xl">Миний ном</h1>
        </div>

        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setTab('saved')}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              tab === 'saved' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            Хадгалсан ({books.length})
          </button>
          <button
            onClick={() => setTab('bids')}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              tab === 'bids' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            Миний саналууд ({bidBooks.length})
          </button>
        </div>

        {tab === 'saved' ? (
          books.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <img src="/mascot.png" alt="" aria-hidden="true" className="mb-4 h-20 w-20 opacity-60 grayscale" />
              <p className="text-muted">Одоогоор хадгалсан ном байхгүй байна.</p>
              <Link to="/library" className="mt-4 font-semibold text-accent hover:underline">
                Номын сан руу очих
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
              {books.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} compact />
              ))}
            </div>
          )
        ) : bidsLoading ? (
          <div className="py-20 text-center text-muted">Ачааллаж байна…</div>
        ) : bidBooks.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <img src="/mascot.png" alt="" aria-hidden="true" className="mb-4 h-20 w-20 opacity-60 grayscale" />
            <p className="text-muted">Та одоогоор ямар ч номд санал өгөөгүй байна.</p>
            <Link to="/library" className="mt-4 font-semibold text-accent hover:underline">
              Номын сан руу очих
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
            {bidBooks.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} compact myBid={book.myBid} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
