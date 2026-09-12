import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import type { Book } from '../types';

interface WishlistContextValue {
  books: Book[];
  loading: boolean;
  isWishlisted: (bookId: string) => boolean;
  toggle: (bookId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

// Single source of truth for the wishlist: both the navbar badge/heart
// icons and the Wishlist page read from this same `books` list, so they
// can never disagree with each other the way two independent fetches can.
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!user) {
      setBooks([]);
      return;
    }
    setLoading(true);
    api
      .get<{ books: Book[] }>('/wishlist')
      .then((res) => setBooks(res.books))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (bookId: string) => {
      if (!user) return;
      const wasWishlisted = books.some((b) => b.id === bookId);

      if (wasWishlisted) {
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
      }

      try {
        if (wasWishlisted) {
          await api.delete(`/wishlist/${bookId}`);
        } else {
          await api.post(`/wishlist/${bookId}`);
          refresh(); // pull the full book record for the newly added item
        }
      } catch {
        refresh(); // re-sync with the server on any failure
      }
    },
    [books, user, refresh],
  );

  const value = useMemo(
    () => ({
      books,
      loading,
      isWishlisted: (bookId: string) => books.some((b) => b.id === bookId),
      toggle,
    }),
    [books, loading, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
