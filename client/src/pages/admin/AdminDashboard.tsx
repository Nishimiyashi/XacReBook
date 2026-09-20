import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { AdminBook, Book } from '../../types';
import { formatPrice } from '../../lib/format';
import Dropdown from '../../components/Dropdown';

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

type DemandFilter = 'all' | 'bid' | 'no_bid' | 'saved_no_bid';
type AdminSort = 'most_bids' | 'most_bidders' | 'most_saved' | 'price_up' | 'price_desc' | 'least_bids' | 'newest';

const ADMIN_SORTS: { value: AdminSort; label: string }[] = [
  { value: 'most_bids', label: 'Хамгийн олон санал' },
  { value: 'most_bidders', label: 'Хамгийн олон өрсөлдөгч' },
  { value: 'most_saved', label: 'Хамгийн их хадгалсан' },
  { value: 'price_up', label: 'Үнэ хамгийн их өссөн' },
  { value: 'price_desc', label: 'Одоогийн үнэ: ихээс бага' },
  { value: 'least_bids', label: 'Хамгийн бага санал' },
  { value: 'newest', label: 'Хамгийн шинэ' },
];

const actionBtn =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-fg">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [demand, setDemand] = useState<DemandFilter>('all');
  const [sort, setSort] = useState<AdminSort>('most_bids');

  function load() {
    setLoading(true);
    api
      .get<{ books: AdminBook[] }>('/admin/books')
      .then((res) => setBooks(res.books))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}"-г устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return;
    await api.delete(`/admin/books/${id}`);
    load();
  }

  const stats = useMemo(
    () => ({
      total: books.length,
      live: books.filter((b) => b.status === 'live').length,
      upcoming: books.filter((b) => b.status === 'upcoming').length,
      ended: books.filter((b) => b.status === 'ended').length,
      bids: books.reduce((sum, b) => sum + b.bidCount, 0),
      withBids: books.filter((b) => b.bidCount > 0).length,
      noBids: books.filter((b) => b.bidCount === 0).length,
      savedNoBid: books.filter((b) => b.bidCount === 0 && b.wishlistCount > 0).length,
    }),
    [books],
  );

  const hasFilters = demand !== 'all' || search.trim() !== '';

  function clearFilters() {
    setDemand('all');
    setSearch('');
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = books.filter(
      (b) =>
        (demand === 'all' ||
          (demand === 'bid' && b.bidCount > 0) ||
          (demand === 'no_bid' && b.bidCount === 0) ||
          (demand === 'saved_no_bid' && b.bidCount === 0 && b.wishlistCount > 0)) &&
        (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
    );
    const rise = (b: AdminBook) => b.currentPrice - b.startingPrice;
    const byNewest = (x: AdminBook, y: AdminBook) => y.createdAt.localeCompare(x.createdAt);
    const sorted = [...list];
    if (sort === 'most_bids') sorted.sort((x, y) => y.bidCount - x.bidCount || y.wishlistCount - x.wishlistCount || byNewest(x, y));
    else if (sort === 'most_bidders') sorted.sort((x, y) => y.bidderCount - x.bidderCount || y.bidCount - x.bidCount || byNewest(x, y));
    else if (sort === 'most_saved') sorted.sort((x, y) => y.wishlistCount - x.wishlistCount || y.bidCount - x.bidCount || byNewest(x, y));
    else if (sort === 'price_up') sorted.sort((x, y) => rise(y) - rise(x) || byNewest(x, y));
    else if (sort === 'price_desc') sorted.sort((x, y) => y.currentPrice - x.currentPrice || byNewest(x, y));
    else if (sort === 'least_bids') sorted.sort((x, y) => x.bidCount - y.bidCount || x.wishlistCount - y.wishlistCount || byNewest(x, y));
    else sorted.sort(byNewest);
    return sorted;
  }, [books, search, demand, sort]);

  if (loading) return <p className="text-muted">Номууд ачааллаж байна…</p>;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Нийт ном" value={stats.total} />
        <StatCard label="Нийт санал" value={stats.bids} />
        <StatCard label="Санал ирсэн ном" value={stats.withBids} />
        <StatCard label="Санал ирээгүй" value={stats.noBids} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-fg">
          Номууд ({hasFilters ? `${filtered.length} / ${books.length}` : books.length})
        </h1>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Гарчиг, зохиогчоор хайх…"
            className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-64"
          />
          <Link
            to="/admin/books/new"
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg shadow-glow hover:brightness-110"
          >
            + Шинэ ном
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Dropdown
          pill
          className="w-64"
          value={demand}
          onChange={setDemand}
          options={[
            { value: 'all', label: `Бүх ном (${stats.total})` },
            { value: 'bid', label: `🔥 Санал ирсэн (${stats.withBids})` },
            { value: 'no_bid', label: `Санал ирээгүй (${stats.noBids})` },
            { value: 'saved_no_bid', label: `❤ Хадгалсан, санал үгүй (${stats.savedNoBid})` },
          ]}
        />
        <Dropdown pill className="w-60" value={sort} options={ADMIN_SORTS} onChange={setSort} />
        {hasFilters && (
          <button onClick={clearFilters} className="px-2 text-sm font-semibold text-muted hover:text-accent">
            Цэвэрлэх ✕
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
          {hasFilters ? 'Шүүлтүүрт тохирох ном олдсонгүй.' : 'Одоогоор ном алга байна.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Зураг</th>
                <th className="min-w-[14rem] px-4 py-3">Гарчиг</th>
                <th className="whitespace-nowrap px-4 py-3">Санал</th>
                <th className="whitespace-nowrap px-4 py-3">Хадгалсан</th>
                <th className="whitespace-nowrap px-4 py-3">Одоогийн үнэ</th>
                <th className="whitespace-nowrap px-4 py-3">Төлөв</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book) => (
                <tr key={book.id} className="border-t border-border transition hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    <img src={book.coverImageUrl} alt={book.title} className="h-14 w-10 rounded object-cover" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-fg">{book.title}</p>
                    <p className="text-xs text-muted">{book.author}</p>
                    <p className="mt-0.5 text-[11px] text-accent/80">{book.genre}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className={`font-semibold ${book.bidCount > 0 ? 'text-fg' : 'text-muted'}`}>{book.bidCount}</p>
                    <p className="text-xs text-muted">{book.bidderCount} хүн</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-fg">
                    <span className={book.wishlistCount > 0 ? 'font-semibold text-fg' : 'text-muted'}>♥ {book.wishlistCount}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="text-fg">{formatPrice(book.currentPrice)}</p>
                    {book.currentPrice > book.startingPrice && (
                      <p className="text-xs font-semibold text-emerald-500">
                        ▲ {formatPrice(book.currentPrice - book.startingPrice)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[book.status]}`}>
                      {STATUS_LABELS[book.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/books/${book.id}/bidders`}
                        className={`${actionBtn} border-border text-fg/80 hover:border-accent hover:text-accent`}
                      >
                        <Icon>
                          <circle cx="9" cy="8" r="3.2" />
                          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                          <path d="M16 4.5a3.2 3.2 0 0 1 0 6M18 14.4c1.8.8 3 2.6 3 5.6" />
                        </Icon>
                        Өрсөлдөгчид
                      </Link>
                      <Link
                        to={`/admin/books/${book.id}/edit`}
                        className={`${actionBtn} border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-accent-fg`}
                      >
                        <Icon>
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                        </Icon>
                        Засах
                      </Link>
                      <button
                        onClick={() => handleDelete(book.id, book.title)}
                        className={`${actionBtn} border-red-400/40 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white`}
                      >
                        <Icon>
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2M6 6l1 14h10l1-14" />
                        </Icon>
                        Устгах
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
