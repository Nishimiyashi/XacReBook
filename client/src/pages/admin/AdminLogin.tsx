import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ApiError } from '../../lib/api';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Нэвтэрч чадсангүй');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <div className="mb-6 text-center">
          <img src="/siteIcon.png" alt="" aria-hidden="true" className="mx-auto mb-3 h-10 w-10 object-contain" />
          <h1 className="font-display text-2xl font-bold text-fg">Админ нэвтрэх</h1>
          <p className="mt-1 text-sm text-muted">Номын каталог болон номын худалдааг удирдах.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-fg">Хэрэглэгчийн нэр</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-fg">Нууц үг</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent py-2.5 font-semibold text-accent-fg shadow-glow transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? 'Нэвтэрч байна…' : 'Нэвтрэх'}
          </button>
        </div>
      </form>
    </div>
  );
}
