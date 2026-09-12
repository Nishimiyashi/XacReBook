export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-950 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div>
          <span className="font-display text-lg font-bold text-white">
            Xac<span className="text-accent">Re</span>Book
          </span>
          <p className="mt-1 text-xs text-navy-100/70">Номын дуудлага худалдаа</p>
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <p className="text-xs uppercase tracking-widest text-navy-100/60">Зохион байгуулагч</p>
          <img src="/logo.png" alt="Хөгжлийн Алтан Сан" className="h-8 w-auto sm:h-9" />
        </div>
      </div>
    </footer>
  );
}
