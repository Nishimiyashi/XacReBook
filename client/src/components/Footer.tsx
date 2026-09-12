const ORGANIZER_PHONE = '+976 0000 0000'; // TODO: replace with real organizer phone number
const TECH_PHONE = '+976 1111 1111'; // TODO: replace with real tech/support phone number

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <span className="font-logo text-base font-bold text-white">
              <span className="text-accent">Афлатон</span> номын аян
            </span>
            <p className="mt-1 text-xs text-navy-100/70">Номын дуудлага худалдаа</p>
          </div>

          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className="text-xs uppercase tracking-widest text-navy-100/60">Холбоо барих</p>
            <a href={`tel:${ORGANIZER_PHONE.replace(/\s/g, '')}`} className="text-sm text-navy-100 transition hover:text-accent">
              Зохион байгуулагч: <span className="font-semibold">{ORGANIZER_PHONE}</span>
            </a>
            <a href={`tel:${TECH_PHONE.replace(/\s/g, '')}`} className="text-sm text-navy-100 transition hover:text-accent">
              Техник тусламж: <span className="font-semibold">{TECH_PHONE}</span>
            </a>
          </div>

          <div className="flex flex-col items-center gap-2 sm:items-end">
            <p className="text-xs uppercase tracking-widest text-navy-100/60">Зохион байгуулагч</p>
            <img src="/logo.png" alt="Хөгжлийн Алтан Сан" className="h-8 w-auto sm:h-9" />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-navy-800 pt-6 text-xs text-navy-100/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Афлатон номын аян. All rights reserved.</p>
          <p>Made with ❤️ and ☕</p>
        </div>
      </div>
    </footer>
  );
}
