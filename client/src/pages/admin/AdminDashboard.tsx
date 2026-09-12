import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Book } from '../../types';
import { formatPrice } from '../../lib/format';

const STATUS_STYLES: Record<Book['status'], string> = {
  upcoming: 'bg-slate-400/10 text-slate-500',
  live: 'bg-emerald-400/10 text-emerald-500',
  ended: 'bg-red-400/10 text-red-500',
};

const STATUS_LABELS: Record<Book['status'], string> = {
  upcoming: 'Удахгүй',
  live: 'Явж байгаа',
  ended: 'Дууссан',
};

export default function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get<{ books: Book[] }>('/admin/books')
      .then((res) => setBooks(res.books))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}"-г устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return;
    await api.delete(`/admin/books/${id}`);
    load();
  }

  if (loading) return <p className="text-muted">Номууд ачааллаж байна…</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-fg">Номууд ({books.length})</h1>
        <Link to="/admin/books/new" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg shadow-glow hover:brightness-110">
          + Шинэ ном
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Зураг</th>
              <th className="px-4 py-3">Гарчиг</th>
              <th className="px-4 py-3">Төрөл</th>
              <th className="px-4 py-3">Одоогийн үнэ</th>
              <th className="px-4 py-3">Төлөв</th>
              <th className="px-4 py-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <img src={book.coverImageUrl} alt={book.title} className="h-14 w-10 rounded object-cover" />
                </td>
                <td className="px-4 py-3 font-medium text-fg">{book.title}</td>
                <td className="px-4 py-3 text-muted">{book.genre}</td>
                <td className="px-4 py-3 text-fg">{formatPrice(book.currentPrice)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[book.status]}`}>
                    {STATUS_LABELS[book.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/admin/books/${book.id}/bidders`} className="mr-3 text-accent hover:underline">
                    Тэргүүлэгчид
                  </Link>
                  <Link to={`/admin/books/${book.id}/edit`} className="mr-3 text-accent hover:underline">
                    Засах
                  </Link>
                  <button onClick={() => handleDelete(book.id, book.title)} className="text-red-500 hover:underline">
                    Устгах
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
