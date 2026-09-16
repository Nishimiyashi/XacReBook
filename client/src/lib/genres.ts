import { useEffect, useState } from 'react';
import { api } from './api';

export const GENRES = [
  'Уран зохиол',
  'Хувь хүний хөгжил',
  'Бизнес, эдийн засаг',
  'Түүх, соёл',
  'Шинжлэх ухаан',
  'Бусад',
] as const;

// Genres are free-text on Book, so any custom genre entered while
// registering a book only becomes choosable/filterable elsewhere once it's
// merged in here with the ones already used across existing books.
export function useGenres(): string[] {
  const [genres, setGenres] = useState<string[]>([...GENRES]);

  useEffect(() => {
    api
      .get<{ genres: string[] }>('/books/genres')
      .then((res) => {
        setGenres((prev) => Array.from(new Set([...prev, ...res.genres])));
      })
      .catch(() => {});
  }, []);

  return genres;
}
