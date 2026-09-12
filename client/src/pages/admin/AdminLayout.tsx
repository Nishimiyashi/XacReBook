import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Номууд' },
  { to: '/admin/books/new', label: 'Шинэ ном' },
];

export default function AdminLayout() {
  const { admin, loading, logout } = useAdminAuth();

  if (loading) {
    return <div className="py-24 text-center text-muted">Ачааллаж байна…</div>;
  }

  if (!admin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-6">
            <span className="flex min-w-0 items-center gap-2 font-logo text-sm font-bold sm:text-base">
              <span className="text-accent">Афлатон</span>
              <span className="hidden text-fg sm:inline">номын аян</span>
              <span className="hidden shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted sm:inline-block">
                Админ
              </span>
            </span>
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                      isActive ? 'bg-accent text-accent-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{admin.username}</span>
            <button
              onClick={() => void logout()}
              className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-fg transition hover:border-accent hover:text-accent"
            >
              Гарах
            </button>
          </div>
        </div>
        <nav className="flex items-center gap-1 border-t border-border px-4 py-2 sm:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex-1 rounded-full px-3 py-1.5 text-center text-sm font-semibold transition ${
                  isActive ? 'bg-accent text-accent-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}
