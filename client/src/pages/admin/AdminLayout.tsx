import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLayout() {
  const { admin, loading, logout } = useAdminAuth();

  if (loading) {
    return <div className="py-24 text-center text-muted">Ачааллаж байна…</div>;
  }

  if (!admin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-display text-xl font-bold text-fg">
            XacReBook <span className="text-accent">Админ</span>
          </span>
          <nav className="flex gap-4 text-sm font-medium">
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'text-accent' : 'text-muted hover:text-accent')}>
              Номууд
            </NavLink>
            <NavLink to="/admin/books/new" className={({ isActive }) => (isActive ? 'text-accent' : 'text-muted hover:text-accent')}>
              Шинэ ном
            </NavLink>
          </nav>
        </div>
        <button onClick={() => void logout()} className="text-sm font-semibold text-muted hover:text-accent">
          Гарах
        </button>
      </div>
      <Outlet />
    </div>
  );
}
