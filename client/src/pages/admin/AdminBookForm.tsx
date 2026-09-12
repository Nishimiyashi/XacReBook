import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError, uploadCover } from '../../lib/api';
import type { Book } from '../../types';
import { GENRES } from '../../lib/genres';

const emptyForm = {
  title: '',
  author: '',
  summary: '',
  genre: GENRES[0] as string,
  origin: 'foreign' as Book['origin'],
  coverImageUrl: '',
  startingPrice: 10000,
  increment: 2000,
  status: 'live' as Book['status'],
  auctionEndsAt: '',
};

export default function AdminBookForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    api.get<{ books: Book[] }>('/admin/books').then((res) => {
      const book = res.books.find((b) => b.id === id);
      if (book) {
        setForm({
          title: book.title,
          author: book.author,
          summary: book.summary,
          genre: book.genre,
          origin: book.origin,
          coverImageUrl: book.coverImageUrl,
          startingPrice: book.startingPrice,
          increment: book.increment,
          status: book.status,
          auctionEndsAt: book.auctionEndsAt ? book.auctionEndsAt.slice(0, 16) : '',
        });
      }
      setLoading(false);
    });
  }, [id]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadCover(file);
      setForm((f) => ({ ...f, coverImageUrl: url }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Байршуулж чадсангүй');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      ...form,
      auctionEndsAt: form.auctionEndsAt ? new Date(form.auctionEndsAt).toISOString() : null,
    };
    try {
      if (isEdit) {
        await api.put(`/admin/books/${id}`, payload);
      } else {
        await api.post('/admin/books', payload);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ном хадгалж чадсангүй');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-muted">Ачааллаж байна…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-fg">{isEdit ? 'Ном засах' : 'Шинэ ном'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Гарчиг">
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Зохиогч">
            <input
              required
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Төрөл">
            <select
              value={form.genre}
              onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
              className={inputClass}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Гарал үүсэл">
            <div className="flex gap-2">
              {(['mongolian', 'foreign'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, origin: value }))}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                    form.origin === value
                      ? 'border-accent bg-accent text-accent-fg'
                      : 'border-border text-fg/80 hover:border-accent hover:text-accent'
                  }`}
                >
                  {value === 'mongolian' ? 'Монгол ном' : 'Гадаад ном'}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Тойм">
          <textarea
            required
            rows={4}
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <Field label="Нүүр зураг">
          <div className="flex items-center gap-4">
            {form.coverImageUrl && (
              <img src={form.coverImageUrl} alt="Нүүр зургийн урьдчилсан харагдац" className="h-24 w-16 rounded object-cover" />
            )}
            <div className="flex-1 space-y-2">
              <input
                placeholder="Зургийн холбоос буулгах…"
                value={form.coverImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                className={inputClass}
              />
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs text-muted" />
              {uploading && <p className="text-xs text-accent">Байршуулж байна…</p>}
            </div>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Эхлэх үнэ (₮)">
            <input
              type="number"
              required
              min={1}
              value={form.startingPrice}
              onChange={(e) => setForm((f) => ({ ...f, startingPrice: Number(e.target.value) }))}
              className={inputClass}
            />
          </Field>
          <Field label="Нэмэгдэх алхам (₮)">
            <input
              type="number"
              required
              min={1}
              value={form.increment}
              onChange={(e) => setForm((f) => ({ ...f, increment: Number(e.target.value) }))}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Дуусах хугацаа">
            <input
              type="datetime-local"
              value={form.auctionEndsAt}
              onChange={(e) => setForm((f) => ({ ...f, auctionEndsAt: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Төлөв">
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Book['status'] }))}
              className={inputClass}
            >
              <option value="upcoming">Удахгүй (нуугдсан)</option>
              <option value="live">Явж байгаа</option>
              <option value="ended">Дууссан</option>
            </select>
          </Field>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-fg shadow-glow hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? 'Хадгалж байна…' : isEdit ? 'Хадгалах' : 'Ном үүсгэх'}
          </button>
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="rounded-full border border-border px-6 py-2.5 font-semibold text-fg">
            Цуцлах
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/30';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}
