import { NavLink } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Загварыг сэлгэх"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-fg transition hover:border-accent hover:text-accent"
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors ${
    isActive ? 'text-accent' : 'text-fg/80 hover:text-accent'
  }`;

const ICONS = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  library: (
    <>
      <path d="M12 6.5C10.3 5.1 7.8 4.6 4 5v13.5c3.8-.5 6.3 0 8 1.5 1.7-1.5 4.2-2 8-1.5V5c-3.8-.5-6.3 0-8 1.5z" />
      <path d="M12 6.5v13.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  heart: <path d="M12 21s-6.7-4.35-9.3-8.2C1 10.1 1.6 6.6 4.4 5.1c2.3-1.2 4.9-.4 6.2 1.5l1.4 2 1.4-2c1.3-1.9 3.9-2.7 6.2-1.5 2.8 1.5 3.4 5 1.7 7.7C18.7 16.65 12 21 12 21z" />,
};

function NavIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {ICONS[name]}
    </svg>
  );
}

const NAV_ITEMS = [
  { to: '/', end: true, label: 'Нүүр', icon: 'home' as const },
  { to: '/library', end: false, label: 'Номын сан', icon: 'library' as const },
  { to: '/info', end: false, label: 'Мэдээлэл', icon: 'info' as const },
];

function WishlistLink() {
  const { books } = useWishlist();
  return (
    <NavLink to="/wishlist" className={linkClass}>
      <NavIcon name="heart" />
      <span>Хадгалсан</span>
      {books.length > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
          {books.length}
        </span>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, openSignIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/siteIcon.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
          <span className="font-display text-xl font-bold text-fg">
            Xac<span className="text-accent">Re</span>Book
          </span>
        </NavLink>

        <nav className="hidden items-center gap-7 sm:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          {user && <WishlistLink />}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted sm:inline">Сайн уу, {user.name.split(' ')[0]}</span>
              <button
                onClick={() => void signOut()}
                className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-fg transition hover:border-accent hover:text-accent"
              >
                Гарах
              </button>
            </div>
          ) : (
            <button
              onClick={openSignIn}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg shadow-glow transition hover:brightness-110"
            >
              Нэвтрэх
            </button>
          )}
        </div>
      </div>
      <nav className="flex items-center gap-6 border-t border-border px-4 py-2 sm:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {user && <WishlistLink />}
      </nav>
    </header>
  );
}
