import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Bidder, Book } from '../../types';
import { formatPrice } from '../../lib/format';

export default function AdminBidders() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<{ books: Book[] }>('/admin/books').then((res) => res.books.find((b) => b.id === id) ?? null),
      api.get<{ bidders: Bidder[] }>(`/admin/books/${id}/bidders`).then((res) => res.bidders),
    ]).then(([bookRes, biddersRes]) => {
      setBook(bookRes);
      setBidders(biddersRes);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="text-muted">Ачааллаж байна…</p>;

  return (
    <div>
      <Link to="/admin/dashboard" className="mb-4 inline-block text-sm font-semibold text-muted hover:text-accent">
        ← Номууд руу буцах
      </Link>

      <div className="mb-6 flex items-center gap-4">
        {book && <img src={book.coverImageUrl} alt={book.title} className="h-20 w-14 rounded object-cover" />}
        <div>
          <h1 className="font-display text-2xl font-bold text-fg">{book?.title ?? 'Ном'}</h1>
          <p className="text-sm text-muted">
            {bidders.length} өрсөлдөгч · Одоогийн үнэ {book ? formatPrice(book.currentPrice) : ''}
          </p>
        </div>
      </div>

      {bidders.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-center text-muted">
          Энэ номонд одоогоор хэн ч үнэ хэлээгүй байна.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">
            Хамгийн өндөр үнэ хэлснээс эхлээд утсаар холбогдож баталгаажуулна уу. Татгалзвал дараагийн хүнд залгана.
          </p>
          {bidders.map((bidder) => (
            <div
              key={bidder.userId}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                bidder.rank === 1 ? 'border-accent bg-accent/5' : 'border-border bg-surface'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    bidder.rank === 1
                      ? 'bg-accent text-accent-fg'
                      : 'bg-surface-2 text-muted'
                  }`}
                >
                  {bidder.rank}
                </span>
                <div>
                  <p className="font-semibold text-fg">{bidder.name}</p>
                  <a href={`tel:${bidder.phone}`} className="text-sm text-accent hover:underline">
                    {bidder.phone}
                  </a>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-fg">{formatPrice(bidder.amount)}</p>
                {bidder.lastBidAt && (
                  <p className="text-xs text-muted">{new Date(bidder.lastBidAt).toLocaleString('mn-MN')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
