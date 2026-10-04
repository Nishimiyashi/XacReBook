import type { AdminBook } from '../types';
// Inlined rather than loaded from a CDN <script src>: Chromium's cross-origin
// protections block that kind of request once this report is saved and
// opened as a local file:// page, which would leave every chart blank.
// ?raw pulls the minified source in as a plain string at build time.
import chartJsSource from './vendor/chart.umd.min.js?raw';

export interface ReportBid {
  id: string;
  bookId: string;
  bookTitle: string;
  amount: number;
  createdAt: string;
  userName: string;
  userPhone: string;
}

export interface ReportData {
  generatedAt: string;
  books: AdminBook[];
  bids: ReportBid[];
}

// The report is a single, self-contained HTML file an admin downloads and
// opens on its own — so everything it needs (styling, Chart.js, and the
// data itself) has to travel inside this one document. All rendering
// happens client-side, in the report's own <script>, reading the JSON blob
// embedded below — that keeps this generator a static template with
// exactly one dynamic seam (the data), instead of two layers of JS templating
// fighting over the same backticks.
export function buildAdminReportHtml(data: ReportData): string {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    '<!doctype html>\n' +
    '<html lang="mn">\n' +
    '<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>Афлатон номын аян — Тайлан</title>\n' +
    '<script>' + chartJsSource.split('</script').join('<\\/script') + '<\/script>\n' +
    '<style>' + REPORT_CSS + '</style>\n' +
    '</head>\n' +
    '<body>\n' +
    REPORT_BODY +
    '<script id="report-data" type="application/json">' + json + '<\/script>\n' +
    '<script>' + REPORT_JS + '<\/script>\n' +
    '</body>\n' +
    '</html>\n'
  );
}

const REPORT_CSS = `
  :root {
    --bg: #f7f5f2; --card: #ffffff; --fg: #1a1a2e; --muted: #6b7280;
    --accent: #ff7a1a; --accent-dim: #ffe2cc; --border: #e8e4de;
    --navy: #0b1220; --navy-2: #121b31;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    scroll-snap-type: y proximity;
  }
  .screen {
    min-height: 100vh; width: 100%; scroll-snap-align: start;
    display: flex; flex-direction: column; justify-content: center;
    padding: 5rem 1.5rem; position: relative;
  }
  .wrap { max-width: 1100px; margin: 0 auto; width: 100%; }
  h1, h2, h3 { font-family: Georgia, 'Times New Roman', serif; margin: 0; }
  h2.section-title { font-size: clamp(1.5rem, 4vw, 2.25rem); margin-bottom: .5rem; }
  p.section-sub { color: var(--muted); margin: 0 0 2.5rem; font-size: 1rem; }

  /* Hero */
  #hero { background: radial-gradient(circle at 20% 20%, #1a2744, var(--navy) 60%); color: #fff; text-align: center; }
  #hero .eyebrow { color: var(--accent); font-weight: 700; letter-spacing: .15em; text-transform: uppercase; font-size: .8rem; }
  #hero h1 { font-size: clamp(2.2rem, 6vw, 4rem); margin: .75rem 0; line-height: 1.1; }
  #hero .meta { color: #9aa4bd; font-size: .95rem; margin-bottom: 3rem; }
  #hero .hero-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 2.5rem; }
  #hero .hero-stat .num { font-family: Georgia, serif; font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; color: var(--accent); }
  #hero .hero-stat .lbl { color: #cbd3e6; font-size: .85rem; margin-top: .25rem; }
  #hero .scroll-hint { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); color: #7c87a6; font-size: .8rem; animation: bob 1.8s ease-in-out infinite; }
  @keyframes bob { 0%,100% { transform: translate(-50%,0); } 50% { transform: translate(-50%,8px); } }

  /* Nav dots */
  #navdots { position: fixed; right: 1.25rem; top: 50%; transform: translateY(-50%); z-index: 50; display: flex; flex-direction: column; gap: .6rem; }
  #navdots a { position: relative; width: 10px; height: 10px; border-radius: 999px; background: var(--border); display: block; transition: background .2s, transform .2s; }
  #navdots a.active { background: var(--accent); transform: scale(1.3); }
  #navdots a::after {
    content: attr(data-label); position: absolute; right: 1.4rem; top: 50%; transform: translateY(-50%);
    background: var(--navy); color: #fff; font-size: .72rem; font-weight: 600; padding: .25rem .6rem; border-radius: .4rem;
    white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .15s;
  }
  #navdots a:hover::after { opacity: 1; }
  @media (max-width: 720px) { #navdots { display: none; } }

  /* Reveal animation */
  .reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s ease, transform .7s ease; }
  .reveal.in { opacity: 1; transform: none; }
  .reveal.d1 { transition-delay: .08s; } .reveal.d2 { transition-delay: .16s; }
  .reveal.d3 { transition-delay: .24s; } .reveal.d4 { transition-delay: .32s; }

  /* Playing-card treatment, shared by every icon-bearing summary card: rounded
     stock, an inset "printed border" line, a stacked-paper shadow, and a
     lift + tilt on hover like picking a card up off the table. */
  .poker-card {
    position: relative; border-radius: 1.1rem; overflow: hidden;
    box-shadow: 0 1px 2px rgba(20,20,30,.05), 0 12px 22px -12px rgba(20,20,30,.22);
    transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s ease;
  }
  .poker-card::before { content: ''; position: absolute; inset: 5px; border: 1px solid rgba(20,20,30,.06); border-radius: .78rem; pointer-events: none; }
  .poker-card:hover { transform: translateY(-6px) rotate(-1deg); box-shadow: 0 1px 2px rgba(20,20,30,.06), 0 22px 34px -14px rgba(20,20,30,.3); z-index: 2; }
  .poker-card:nth-child(even):hover { transform: translateY(-6px) rotate(1deg); }
  .poker-card.dark::before { border-color: rgba(255,255,255,.1); }

  /* Stat cards */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1rem; }
  .stat-card { background: var(--card); border: 1px solid var(--border); padding: 1.3rem 1.4rem; }
  .stat-card .num, .stat-card .numtext { font-family: Georgia, serif; font-size: 2rem; font-weight: 700; color: var(--fg); }
  .stat-card .lbl { color: var(--muted); font-size: .82rem; margin-top: .2rem; }
  .stat-card .sub { color: var(--accent); font-size: .75rem; font-weight: 700; margin-top: .4rem; }

  /* Project — the primary section: what I actually built */
  #project { background: linear-gradient(180deg, var(--bg) 0%, #fff 100%); }
  .project-lede { font-size: 1.1rem; line-height: 1.75; color: #3a3f4b; max-width: 76ch; margin-bottom: 1.75rem; }
  .project-lede strong { color: var(--fg); }
  .tech-pills { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 2.5rem; }
  .tech-pill { background: var(--navy); color: #fff; font-size: .78rem; font-weight: 600; padding: .35rem .85rem; border-radius: 999px; }

  /* Card deck: a swipeable, snap-to-card row — one card at a time on a phone,
     three at a time from tablet width up. Native touch/trackpad swipe does
     the real scrolling; arrow buttons are a mouse-friendly extra, and each
     one only shows up once there's actually somewhere left to scroll to in
     that direction (hidden at the start/end instead of always sitting there). */
  .deck-wrap { position: relative; }
  .feature-grid, .impact-grid, .spotlight-grid {
    display: flex; gap: 1.1rem; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch; scrollbar-width: none; padding: .2rem .1rem .6rem;
  }
  .feature-grid::-webkit-scrollbar, .impact-grid::-webkit-scrollbar, .spotlight-grid::-webkit-scrollbar { display: none; }
  .feature-grid > div, .impact-grid > div, .spotlight-grid > div { scroll-snap-align: start; flex: 0 0 82%; }
  @media (min-width: 640px) {
    .feature-grid > div, .impact-grid > div { flex: 0 0 calc((100% - 2 * 1.1rem) / 3); }
    .spotlight-grid > div { flex: 0 0 calc((100% - 2 * 1.1rem) / 3); }
  }
  .deck-arrow {
    position: absolute; top: 50%; transform: translateY(-50%); width: 2.3rem; height: 2.3rem; border-radius: 999px;
    background: #fff; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,.1); cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: var(--fg); z-index: 5;
    transition: background .15s, color .15s, opacity .2s, visibility .2s;
    opacity: 0; visibility: hidden;
  }
  .deck-arrow.show { opacity: 1; visibility: visible; }
  .deck-arrow:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
  .deck-arrow.prev { left: -.7rem; }
  .deck-arrow.next { right: -.7rem; }
  @media (max-width: 480px) { .deck-arrow { width: 2rem; height: 2rem; font-size: 1rem; } .deck-arrow.prev { left: -.4rem; } .deck-arrow.next { right: -.4rem; } }
  .deck-dots { display: flex; justify-content: center; gap: .4rem; margin-top: .6rem; }
  .deck-dots span { width: 6px; height: 6px; border-radius: 999px; background: var(--border); transition: background .2s, transform .2s; }
  .deck-dots span.active { background: var(--accent); transform: scale(1.3); }

  .feature-card { background: var(--card); border: 1px solid var(--border); padding: 1.4rem 1.3rem; text-align: center; display: flex; flex-direction: column; align-items: center; }
  .feature-card .ic { width: 2.6rem; height: 2.6rem; border-radius: .8rem; background: var(--accent-dim); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin: 0 auto .8rem; }
  .feature-card .title { font-weight: 700; margin-bottom: .3rem; }
  .feature-card .desc { color: var(--muted); font-size: .85rem; line-height: 1.5; }

  /* Marks the data screens below as secondary / supporting, not the headline */
  .secondary-flag { display: inline-flex; align-items: center; gap: .4rem; background: var(--accent-dim); color: #9a4a00; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: .3rem .7rem; border-radius: 999px; margin-bottom: .9rem; }

  /* Impact / supporting usage summary */
  .narrative { font-size: 1.05rem; line-height: 1.7; color: #3a3f4b; max-width: 72ch; }
  .narrative strong { color: var(--accent); font-weight: 800; }
  .impact-grid { margin: 2rem 0; }
  .impact-card { background: var(--card); border: 1px solid var(--border); padding: 1.2rem 1.3rem; text-align: center; display: flex; flex-direction: column; align-items: center; }
  .impact-card .ic { font-size: 1.3rem; margin-bottom: .5rem; }
  .impact-card .num { font-family: Georgia, serif; font-size: 1.7rem; font-weight: 700; color: var(--fg); }
  .impact-card .lbl { color: var(--muted); font-size: .78rem; margin-top: .2rem; }
  .spotlight-card { background: linear-gradient(145deg, #1a2744, var(--navy)); color: #fff; padding: 1.3rem 1.4rem; display: flex; gap: 1rem; align-items: center; text-align: left; }
  .spotlight-card .cover { width: 46px; height: 64px; object-fit: cover; border-radius: 6px; flex-shrink: 0; background: rgba(255,255,255,.1); }
  .spotlight-card .ic { width: 46px; height: 46px; border-radius: 999px; background: rgba(255,122,26,.18); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
  .spotlight-card .eyebrow { color: var(--accent); font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
  .spotlight-card .title { font-weight: 700; margin: .15rem 0; line-height: 1.25; }
  .spotlight-card .sub { color: #aab2c8; font-size: .8rem; }

  /* Charts */
  .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.25rem; }
  .chart-card { background: var(--card); border: 1px solid var(--border); border-radius: 1.1rem; padding: 1.3rem; }
  .chart-card h3 { font-size: 1rem; font-family: inherit; font-weight: 700; margin-bottom: .9rem; }
  .chart-card .chart-wrap { position: relative; height: 260px; }
  .chart-card .insight { margin-top: .8rem; padding-top: .7rem; border-top: 1px dashed var(--border); font-size: .8rem; color: var(--muted); }
  .chart-card .insight strong { color: var(--fg); }

  /* Leaderboard */
  .board { display: flex; flex-direction: column; gap: .55rem; }
  .board-row { display: flex; align-items: center; gap: .9rem; background: var(--card); border: 1px solid var(--border); border-radius: .9rem; padding: .65rem .9rem; }
  .board-row .rank { width: 1.8rem; height: 1.8rem; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: .8rem; background: var(--accent-dim); color: #9a4a00; flex-shrink: 0; }
  .board-row:nth-child(1) .rank { background: #fde68a; color: #7a5200; }
  .board-row:nth-child(2) .rank { background: #e2e8f0; color: #475569; }
  .board-row:nth-child(3) .rank { background: #fcd9b6; color: #9a4a00; }
  .board-row .name { font-weight: 600; flex: 1; min-width: 0; }
  .board-row .phone { color: var(--muted); font-size: .78rem; }
  .board-row .amt { font-weight: 700; color: var(--accent); white-space: nowrap; }
  .board-row .bc { color: var(--muted); font-size: .76rem; white-space: nowrap; }

  /* Table */
  .toolbar { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 1rem; align-items: center; }
  .toolbar input[type=search] { flex: 1; min-width: 200px; padding: .6rem .9rem; border-radius: 999px; border: 1px solid var(--border); font-size: .9rem; background: var(--card); }
  .toolbar button.chip { padding: .45rem .9rem; border-radius: 999px; border: 1px solid var(--border); background: var(--card); font-size: .82rem; font-weight: 600; cursor: pointer; color: var(--fg); }
  .toolbar button.chip.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  table.report-table { width: 100%; border-collapse: collapse; background: var(--card); border: 1px solid var(--border); border-radius: 1rem; overflow: hidden; font-size: .86rem; }
  table.report-table th { text-align: left; padding: .7rem .8rem; background: #f1ede7; font-size: .72rem; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); cursor: pointer; user-select: none; white-space: nowrap; }
  table.report-table th:hover { color: var(--accent); }
  table.report-table td { padding: .65rem .8rem; border-top: 1px solid var(--border); vertical-align: top; }
  table.report-table tr.book-row { cursor: pointer; }
  table.report-table tr.book-row:hover { background: #fff8f2; }
  table.report-table .cover { width: 34px; height: 48px; object-fit: cover; border-radius: 4px; background: #eee; }
  .badge { display: inline-block; padding: .2rem .55rem; border-radius: 999px; font-size: .72rem; font-weight: 700; }
  .badge.live { background: #d1fae5; color: #047857; }
  .badge.upcoming { background: #e2e8f0; color: #475569; }
  .badge.ended { background: #fee2e2; color: #b91c1c; }
  .rise { color: #059669; font-weight: 700; font-size: .76rem; }
  tr.detail-row td { background: #fbf9f6; padding: 0; }
  .detail-inner { padding: .9rem 1.2rem 1.2rem 3.4rem; }
  .detail-inner .bidder { display: flex; justify-content: space-between; gap: 1rem; padding: .35rem 0; border-bottom: 1px dashed var(--border); font-size: .82rem; }
  .detail-inner .bidder:last-child { border-bottom: none; }
  .detail-empty { color: var(--muted); font-size: .82rem; font-style: italic; }

  footer.screen { min-height: 40vh; text-align: center; color: #9aa4bd; background: var(--navy-2); }
  footer.screen .brand { color: #fff; font-family: Georgia, serif; font-size: 1.3rem; margin-bottom: .4rem; }
`;

const REPORT_BODY = `
  <nav id="navdots">
    <a href="#hero" data-label="Нүүр"></a>
    <a href="#project" data-label="Төсөл"></a>
    <a href="#impact" data-label="Ашиглалт"></a>
    <a href="#overview" data-label="Тойм"></a>
    <a href="#charts" data-label="График"></a>
    <a href="#leaderboard" data-label="Тэргүүлэгчид"></a>
    <a href="#table" data-label="Номууд"></a>
  </nav>

  <section id="hero" class="screen">
    <div class="wrap">
      <div class="eyebrow">Афлатон номын аян</div>
      <h1>Вэб платформын хөгжүүлэлтийн тайлан</h1>
      <div class="meta" id="generated-at"></div>
      <div class="hero-stats" id="hero-stats"></div>
    </div>
    <div class="scroll-hint">↓ доош гүйлгэнэ үү</div>
  </section>

  <section id="project" class="screen">
    <div class="wrap">
      <h2 class="section-title reveal">Миний хийсэн ажил — бүтээсэн систем</h2>
      <p class="section-sub reveal">Сайн дурын ажлынхаа хүрээнд би энэ номын хандивын аяны вэб платформыг эхнээс нь төлөвлөж, дизайн хийж, хөгжүүлж, байршуулсан</p>
      <p class="project-lede reveal">
        Энэ бол <strong>Афлатон номын аян</strong>-ыг дэмжих зорилготой бүрэн стек (full-stack) вэб платформ.
        Хэрэглэгчид ном үзэж, шүүж, бодит цагийн дуудлага худалдаанд оролцож, өөрийн саналаа хянах боломжтой бол
        зохион байгуулагчид админ самбараас ном удирдаж, эрэлтийг шинжилж, энэ мэт интерактив тайлан гаргах боломжтой.
      </p>
      <div class="tech-pills reveal">
        <span class="tech-pill">React</span><span class="tech-pill">TypeScript</span><span class="tech-pill">Tailwind CSS</span>
        <span class="tech-pill">Node.js</span><span class="tech-pill">Express</span><span class="tech-pill">PostgreSQL</span>
        <span class="tech-pill">Prisma ORM</span><span class="tech-pill">Socket.io</span>
      </div>
      <div class="deck-wrap reveal">
        <button type="button" class="deck-arrow prev" id="feature-prev" aria-label="Өмнөх">‹</button>
        <div class="feature-grid" id="feature-grid"></div>
        <button type="button" class="deck-arrow next" id="feature-next" aria-label="Дараах">›</button>
      </div>
      <div class="deck-dots" id="feature-dots"></div>
    </div>
  </section>

  <section id="impact" class="screen">
    <div class="wrap">
      <div class="secondary-flag reveal">Нэмэлт мэдээлэл</div>
      <h2 class="section-title reveal">Систем хэрхэн ашиглагдаж байна</h2>
      <p class="section-sub reveal">Доорх тоо, график нь энэ системийг ашиглан цугларсан бодит дата — миний хийсэн ажлын хэмжүүр биш, зөвхөн системийн одоогийн үр дүнгийн жишээ</p>
      <p class="narrative reveal" id="impact-narrative"></p>
      <div class="deck-wrap reveal">
        <button type="button" class="deck-arrow prev" id="impact-prev" aria-label="Өмнөх">‹</button>
        <div class="impact-grid" id="impact-grid"></div>
        <button type="button" class="deck-arrow next" id="impact-next" aria-label="Дараах">›</button>
      </div>
      <div class="deck-dots" id="impact-dots"></div>
      <div class="deck-wrap reveal">
        <button type="button" class="deck-arrow prev" id="spotlight-prev" aria-label="Өмнөх">‹</button>
        <div class="spotlight-grid" id="spotlight-grid"></div>
        <button type="button" class="deck-arrow next" id="spotlight-next" aria-label="Дараах">›</button>
      </div>
      <div class="deck-dots" id="spotlight-dots"></div>
    </div>
  </section>

  <section id="overview" class="screen">
    <div class="wrap">
      <h2 class="section-title reveal">Ерөнхий тойм</h2>
      <p class="section-sub reveal">Бүх номын өнөөдрийн байдал нэг дор</p>
      <div class="stat-grid" id="stat-grid"></div>
    </div>
  </section>

  <section id="charts" class="screen">
    <div class="wrap">
      <h2 class="section-title reveal">Статистик</h2>
      <p class="section-sub reveal">Төрөл, төлөв, эрэлт ба цаг хугацаа</p>
      <div class="chart-grid">
        <div class="chart-card reveal d1"><h3>Төрлөөр</h3><div class="chart-wrap"><canvas id="chart-genre"></canvas></div><div class="insight" id="insight-genre"></div></div>
        <div class="chart-card reveal d2"><h3>Төлөвөөр</h3><div class="chart-wrap"><canvas id="chart-status"></canvas></div><div class="insight" id="insight-status"></div></div>
        <div class="chart-card reveal d3"><h3>Хамгийн эрэлттэй 10 ном (саналын тоо)</h3><div class="chart-wrap"><canvas id="chart-top"></canvas></div><div class="insight" id="insight-top"></div></div>
        <div class="chart-card reveal d4"><h3>Саналын урсгал (хуримтлагдсан)</h3><div class="chart-wrap"><canvas id="chart-timeline"></canvas></div><div class="insight" id="insight-timeline"></div></div>
      </div>
    </div>
  </section>

  <section id="leaderboard" class="screen">
    <div class="wrap">
      <h2 class="section-title reveal">Тэргүүлэгч оролцогчид</h2>
      <p class="section-sub reveal">Нийт зарласан дүнгийн нийлбэрээр эрэмбэлсэн (ном бүрээс хамгийн өндөр саналыг нь авч нэмсэн)</p>
      <div class="board reveal" id="leaderboard-list"></div>
    </div>
  </section>

  <section id="table" class="screen" style="min-height:auto; padding-top:5rem; padding-bottom:5rem;">
    <div class="wrap">
      <h2 class="section-title reveal">Номын жагсаалт</h2>
      <p class="section-sub reveal">Багана дээр дарж эрэмбэлнэ, мөр дээр дарж саналын дэлгэрэнгүйг харна</p>
      <div class="toolbar reveal">
        <input type="search" id="search" placeholder="Гарчиг, зохиогч, төрлөөр хайх…">
        <button class="chip active" data-status="all">Бүгд</button>
        <button class="chip" data-status="live">Явж байгаа</button>
        <button class="chip" data-status="upcoming">Удахгүй</button>
        <button class="chip" data-status="ended">Дууссан</button>
      </div>
      <div style="overflow-x:auto" class="reveal">
        <table class="report-table">
          <thead>
            <tr>
              <th></th>
              <th data-key="title">Гарчиг</th>
              <th data-key="genre">Төрөл</th>
              <th data-key="bidCount">Санал</th>
              <th data-key="wishlistCount">Хадгалсан</th>
              <th data-key="currentPrice">Үнэ</th>
              <th data-key="status">Төлөв</th>
            </tr>
          </thead>
          <tbody id="table-body"></tbody>
        </table>
      </div>
    </div>
  </section>

  <footer class="screen">
    <div class="wrap">
      <div class="brand">Афлатон номын аян</div>
      <div id="footer-generated"></div>
    </div>
  </footer>
`;

const REPORT_JS = `
(function () {
  var DATA = JSON.parse(document.getElementById('report-data').textContent);
  var books = DATA.books;
  var bids = DATA.bids;

  function money(n) { return Math.round(n).toLocaleString('en-US') + '₮'; }
  function statusLabel(s) { return s === 'live' ? 'Явж байгаа' : s === 'upcoming' ? 'Удахгүй' : 'Дууссан'; }

  // ---- project screen: static — this describes the platform I built, not the auction data ----
  var features = [
    { ic: '🔐', title: 'Хэрэглэгчийн систем', desc: 'Утасны дугаараар хурдан, аюулгүй бүртгэл ба нэвтрэлт' },
    { ic: '📚', title: 'Номын сан', desc: 'Хайлт, төрөл/үнэ/гарал үүслээр шүүх, олон төрлийн эрэмбэлэлт' },
    { ic: '⚡', title: 'Реал-тайм дуудлага худалдаа', desc: 'Socket.io ашигласан шууд үнийн шинэчлэлт, хугацааны тоолуур' },
    { ic: '❤️', title: 'Хадгалсан & Миний саналууд', desc: 'Хэрэглэгч бүрийн хувийн жагсаалт, идэвхийн хяналт' },
    { ic: '🏅', title: 'Эрэлтийн үзүүлэлт', desc: 'Алт/мөнгө/хүрэл медальтай "ТОП 10" эрэлтийн рэнкинг UI' },
    { ic: '📱', title: 'Responsive дизайн', desc: 'Утас, таблет, компьютер дээр адил тэгш ажиллагаа' },
    { ic: '🌓', title: 'Харанхуй/Цайвар горим', desc: 'Хэрэглэгчийн сонголтоор харагдах байдал солигдоно' },
    { ic: '🛠️', title: 'Админ самбар', desc: 'Ном нэмэх/засах/устгах, зураг байршуулах, бодит цагийн удирдлага' },
    { ic: '📊', title: 'Админ аналитик', desc: 'Эрэлтээр шүүх/эрэмбэлэх, өрсөлдөгчдийн дэлгэрэнгүй жагсаалт' },
    { ic: '📄', title: 'Интерактив HTML тайлан', desc: 'Яг энэ тайлан өөрөө миний бүтээсэн функц — графиктай, бие даасан файл' }
  ];
  var featureGrid = document.getElementById('feature-grid');
  features.forEach(function (f, i) {
    var div = document.createElement('div');
    div.className = 'feature-card poker-card reveal d' + ((i % 4) + 1);
    div.innerHTML = '<div class="ic">' + f.ic + '</div><div class="title">' + f.title + '</div><div class="desc">' + f.desc + '</div>';
    featureGrid.appendChild(div);
  });

  // ---- derived aggregates (computed once, up front, so the impact screen,
  // the overview cards and the charts can all draw from the same numbers) ----
  var totalBooks = books.length;
  var totalBids = bids.length;
  var totalWishlist = books.reduce(function (s, b) { return s + b.wishlistCount; }, 0);
  var uniqueBidders = {};
  bids.forEach(function (b) { uniqueBidders[b.userPhone] = true; });
  var uniqueBidderCount = Object.keys(uniqueBidders).length;
  var totalRaised = books.reduce(function (s, b) { return s + Math.max(0, b.currentPrice - b.startingPrice); }, 0);
  var withBids = books.filter(function (b) { return b.bidCount > 0; }).length;
  var successRatePct = totalBooks ? Math.round((withBids / totalBooks) * 100) : 0;
  var avgCurrentPrice = totalBooks ? books.reduce(function (s, b) { return s + b.currentPrice; }, 0) / totalBooks : 0;
  var avgStartingPrice = totalBooks ? books.reduce(function (s, b) { return s + b.startingPrice; }, 0) / totalBooks : 0;

  var risingBooks = books.filter(function (b) { return b.currentPrice > b.startingPrice && b.startingPrice > 0; });
  var avgRisePct = risingBooks.length
    ? Math.round(risingBooks.reduce(function (s, b) { return s + ((b.currentPrice - b.startingPrice) / b.startingPrice) * 100; }, 0) / risingBooks.length)
    : 0;

  var genreCounts = {};
  books.forEach(function (b) { genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1; });
  var topGenre = Object.keys(genreCounts).sort(function (a, b) { return genreCounts[b] - genreCounts[a]; })[0] || null;

  var statusCounts = { live: 0, upcoming: 0, ended: 0 };
  books.forEach(function (b) { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });

  var topBooks = books.slice().sort(function (a, b) { return b.bidCount - a.bidCount; }).slice(0, 10);
  var topBook = topBooks.length && topBooks[0].bidCount > 0 ? topBooks[0] : null;

  var byDate = {};
  bids.forEach(function (b) {
    var d = b.createdAt.slice(0, 10);
    byDate[d] = (byDate[d] || 0) + 1;
  });
  var dates = Object.keys(byDate).sort();
  var running = 0;
  var cumulative = dates.map(function (d) { running += byDate[d]; return running; });
  var busiestDate = dates.length ? dates.reduce(function (best, d) { return byDate[d] > byDate[best] ? d : best; }, dates[0]) : null;

  // highest bid per user per book, summed across books — this is also what
  // the leaderboard section renders further down.
  var bidderMap = {};
  bids.forEach(function (b) {
    var key = b.userPhone;
    if (!bidderMap[key]) bidderMap[key] = { name: b.userName, phone: b.userPhone, books: {} };
    var entry = bidderMap[key];
    if (!entry.books[b.bookId] || b.amount > entry.books[b.bookId]) entry.books[b.bookId] = b.amount;
  });
  var bidderRows = Object.keys(bidderMap).map(function (k) {
    var e = bidderMap[k];
    var bookIds = Object.keys(e.books);
    var total = bookIds.reduce(function (s, id) { return s + e.books[id]; }, 0);
    return { name: e.name, phone: e.phone, bookCount: bookIds.length, total: total };
  }).sort(function (a, b) { return b.total - a.total; }).slice(0, 15);
  var topBidder = bidderRows.length ? bidderRows[0] : null;

  function fmtDate(d) { return new Date(d).toLocaleDateString('mn-MN'); }

  var genDate = new Date(DATA.generatedAt);
  var genText = 'Үүсгэсэн: ' + genDate.toLocaleString('mn-MN');
  document.getElementById('generated-at').textContent = genText;
  document.getElementById('footer-generated').textContent = genText;

  // ---- hero stats ----
  var heroStats = [
    { num: totalBooks, lbl: 'Ном' },
    { num: totalBids, lbl: 'Нийт санал' },
    { num: uniqueBidderCount, lbl: 'Оролцогч' },
    { num: totalRaised, lbl: 'Нэмэгдсэн дүн (₮)', money: true }
  ];
  var heroEl = document.getElementById('hero-stats');
  heroStats.forEach(function (s) {
    var div = document.createElement('div');
    div.className = 'hero-stat';
    div.innerHTML = '<div class="num" data-target="' + s.num + '" data-money="' + (s.money ? '1' : '0') + '">0</div><div class="lbl">' + s.lbl + '</div>';
    heroEl.appendChild(div);
  });

  // ---- impact screen: a narrative summary, not just raw counts ----
  var narrativeEl = document.getElementById('impact-narrative');
  narrativeEl.innerHTML =
    'Нийт <strong>' + totalBooks + '</strong> номыг дуудлага худалдаанд оруулснаас <strong>' + withBids + '</strong> (' + successRatePct + '%) нь идэвхтэй сонирхол татаж, зарагдах магадлалтай боллоо. ' +
    '<strong>' + uniqueBidderCount + '</strong> хүнээс <strong>' + totalBids + '</strong> санал ирсэн бөгөөд дундаж үнэ <strong>' + money(avgCurrentPrice) + '</strong> (эхлэх дундаж үнэ ' + money(avgStartingPrice) + ') боллоо. ' +
    'Санал ирсэн номуудын үнэ эхлэх үнээсээ дунджаар <strong>' + avgRisePct + '%</strong> өсч, нийт <strong>' + money(totalRaised) + '</strong> нэмэлт дүн бий болгосон.' +
    (topGenre ? ' Хамгийн эрэлттэй төрөл нь <strong>' + escapeHtml(topGenre) + '</strong> байв.' : '');

  var impactCards = [
    { ic: '📚', num: totalBooks, lbl: 'Нийт нэрийн ном' },
    { ic: '📦', num: withBids + ' / ' + totalBooks, lbl: 'Зарагдах магадлалтай ном' },
    { ic: '🔥', num: successRatePct + '%', lbl: 'Сонирхол татсан хувь' },
    { ic: '💵', num: money(avgCurrentPrice), lbl: 'Дундаж үнэ' },
    { ic: '📈', num: avgRisePct + '%', lbl: 'Дундаж үнийн өсөлт' },
    { ic: '🤝', num: uniqueBidderCount, lbl: 'Оролцогчдын хүрээ' },
    { ic: '💰', num: money(totalRaised), lbl: 'Нэмэлт хандив' },
    { ic: '❤', num: totalWishlist, lbl: 'Хадгалсан удаа' }
  ];
  var impactGrid = document.getElementById('impact-grid');
  impactCards.forEach(function (c, i) {
    var div = document.createElement('div');
    div.className = 'impact-card poker-card reveal d' + ((i % 4) + 1);
    div.innerHTML = '<div class="ic">' + c.ic + '</div><div class="num">' + c.num + '</div><div class="lbl">' + c.lbl + '</div>';
    impactGrid.appendChild(div);
  });

  var spotlights = [];
  if (topBook) {
    spotlights.push(
      '<div class="spotlight-card poker-card dark"><img class="cover" src="' + escapeHtml(topBook.coverImageUrl) + '" alt=""><div><div class="eyebrow">Хамгийн эрэлттэй ном</div><div class="title">' + escapeHtml(topBook.title) + '</div><div class="sub">' + topBook.bidCount + ' санал, ' + topBook.bidderCount + ' хүн</div></div></div>'
    );
  }
  if (topBidder) {
    spotlights.push(
      '<div class="spotlight-card poker-card dark"><div class="ic">🏆</div><div><div class="eyebrow">Тэргүүн оролцогч</div><div class="title">' + escapeHtml(topBidder.name) + '</div><div class="sub">' + topBidder.bookCount + ' номонд нийт ' + money(topBidder.total) + '</div></div></div>'
    );
  }
  if (busiestDate) {
    spotlights.push(
      '<div class="spotlight-card poker-card dark"><div class="ic">📅</div><div><div class="eyebrow">Хамгийн идэвхтэй өдөр</div><div class="title">' + fmtDate(busiestDate) + '</div><div class="sub">' + byDate[busiestDate] + ' санал ирсэн</div></div></div>'
    );
  }
  document.getElementById('spotlight-grid').innerHTML = spotlights.join('') || '<p class="detail-empty">Одоогоор дурдах мэдээлэл алга байна.</p>';

  // ---- card decks: swipeable row (native touch/trackpad scroll does the
  // swiping; these just add arrow buttons and dots as a mouse-friendly extra).
  // Each arrow only shows once there's actually more to scroll to in that
  // direction — no arrow sitting uselessly at the start or end of the deck. ----
  function wireDeck(trackId, prevId, nextId, dotsId) {
    var track = document.getElementById(trackId);
    var prev = document.getElementById(prevId);
    var next = document.getElementById(nextId);
    var dotsEl = document.getElementById(dotsId);
    if (!track || !prev || !next || !dotsEl) return;
    var cards = Array.prototype.slice.call(track.children);
    if (cards.length < 2) { prev.style.display = 'none'; next.style.display = 'none'; return; }

    cards.forEach(function (card, i) {
      var dot = document.createElement('span');
      if (i === 0) dot.className = 'active';
      dot.addEventListener('click', function () { card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' }); });
      dotsEl.appendChild(dot);
    });

    function cardStep() {
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -cardStep(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: cardStep(), behavior: 'smooth' }); });

    var ticking = false;
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      prev.classList.toggle('show', track.scrollLeft > 8);
      next.classList.toggle('show', track.scrollLeft < max - 8);
      var idx = Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / cardStep())));
      var dots = dotsEl.children;
      for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('active', i === idx);
      ticking = false;
    }
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    });
    window.addEventListener('resize', update);
    update();
  }
  wireDeck('feature-grid', 'feature-prev', 'feature-next', 'feature-dots');
  wireDeck('impact-grid', 'impact-prev', 'impact-next', 'impact-dots');
  wireDeck('spotlight-grid', 'spotlight-prev', 'spotlight-next', 'spotlight-dots');

  // ---- overview stat cards ----
  var cards = [
    { num: totalBooks, lbl: 'Нийт ном' },
    { num: withBids, lbl: 'Зарагдах магадлалтай ном' },
    { num: totalBooks - withBids, lbl: 'Санал ирээгүй ном' },
    { num: totalBids, lbl: 'Нийт санал' },
    { num: uniqueBidderCount, lbl: 'Өрсөлдөгчдийн тоо' },
    { num: totalWishlist, lbl: 'Нийт хадгалсан' }
  ];
  var cardsExtra = [
    { lbl: 'Дундаж үнэ (одоогийн)', val: money(avgCurrentPrice) },
    { lbl: 'Дундаж эхлэх үнэ', val: money(avgStartingPrice) }
  ];
  var statGrid = document.getElementById('stat-grid');
  cards.forEach(function (c, i) {
    var div = document.createElement('div');
    div.className = 'stat-card poker-card reveal d' + ((i % 4) + 1);
    div.innerHTML = '<div class="num" data-target="' + c.num + '">0</div><div class="lbl">' + c.lbl + '</div>';
    statGrid.appendChild(div);
  });
  cardsExtra.forEach(function (c, i) {
    var div = document.createElement('div');
    div.className = 'stat-card poker-card reveal d' + (((cards.length + i) % 4) + 1);
    div.innerHTML = '<div class="numtext">' + c.val + '</div><div class="lbl">' + c.lbl + '</div>';
    statGrid.appendChild(div);
  });

  // ---- charts (genreCounts, statusCounts, topBooks, dates/cumulative computed up front) ----

  var palette = ['#ff7a1a', '#ffb067', '#2d3748', '#718096', '#38a169', '#3182ce', '#d69e2e', '#e53e3e', '#805ad5', '#319795'];

  if (window.Chart) {
    Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.color = '#6b7280';

    new Chart(document.getElementById('chart-genre'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(genreCounts),
        datasets: [{ data: Object.values(genreCounts), backgroundColor: palette, borderWidth: 0 }]
      },
      options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, maintainAspectRatio: false }
    });

    new Chart(document.getElementById('chart-status'), {
      type: 'doughnut',
      data: {
        labels: ['Явж байгаа', 'Удахгүй', 'Дууссан'],
        datasets: [{ data: [statusCounts.live, statusCounts.upcoming, statusCounts.ended], backgroundColor: ['#38a169', '#718096', '#e53e3e'], borderWidth: 0 }]
      },
      options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, maintainAspectRatio: false }
    });

    new Chart(document.getElementById('chart-top'), {
      type: 'bar',
      data: {
        labels: topBooks.map(function (b) { return b.title.length > 18 ? b.title.slice(0, 18) + '…' : b.title; }),
        datasets: [{ data: topBooks.map(function (b) { return b.bidCount; }), backgroundColor: '#ff7a1a', borderRadius: 6 }]
      },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { x: { ticks: { precision: 0 } } } }
    });

    new Chart(document.getElementById('chart-timeline'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{ data: cumulative, borderColor: '#ff7a1a', backgroundColor: 'rgba(255,122,26,.12)', fill: true, tension: .3, pointRadius: 2 }]
      },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { x: { ticks: { maxTicksLimit: 6 } }, y: { ticks: { precision: 0 } } } }
    });
  }

  // ---- chart insight captions: tie each chart back to a concrete takeaway ----
  document.getElementById('insight-genre').innerHTML = topGenre
    ? 'Хамгийн их тохиолдсон төрөл: <strong>' + escapeHtml(topGenre) + '</strong> (' + genreCounts[topGenre] + ' ном)'
    : 'Мэдээлэл алга';
  document.getElementById('insight-status').innerHTML =
    '<strong>' + statusCounts.live + '</strong> идэвхтэй, <strong>' + statusCounts.upcoming + '</strong> удахгүй, <strong>' + statusCounts.ended + '</strong> дууссан';
  document.getElementById('insight-top').innerHTML = topBook
    ? 'Тэргүүлэгч: <strong>' + escapeHtml(topBook.title) + '</strong> — ' + topBook.bidCount + ' санал'
    : 'Одоогоор санал ирээгүй байна';
  document.getElementById('insight-timeline').innerHTML = busiestDate
    ? 'Хамгийн идэвхтэй өдөр: <strong>' + fmtDate(busiestDate) + '</strong> (' + byDate[busiestDate] + ' санал)'
    : 'Мэдээлэл алга';

  // ---- leaderboard (bidderRows computed up front) ----
  var boardEl = document.getElementById('leaderboard-list');
  if (bidderRows.length === 0) {
    boardEl.innerHTML = '<p class="detail-empty">Одоогоор санал ирээгүй байна.</p>';
  }
  bidderRows.forEach(function (r, i) {
    var row = document.createElement('div');
    row.className = 'board-row';
    row.innerHTML =
      '<div class="rank">' + (i + 1) + '</div>' +
      '<div class="name">' + escapeHtml(r.name) + ' <span class="phone">' + escapeHtml(r.phone) + '</span></div>' +
      '<div class="bc">' + r.bookCount + ' номонд</div>' +
      '<div class="amt">' + money(r.total) + '</div>';
    boardEl.appendChild(row);
  });

  // ---- table ----
  var tbody = document.getElementById('table-body');
  var sortKey = 'bidCount';
  var sortDir = -1;
  var statusFilter = 'all';
  var searchTerm = '';
  var openRow = null;

  function bidderListFor(bookId) {
    var map = {};
    bids.filter(function (b) { return b.bookId === bookId; }).forEach(function (b) {
      if (!map[b.userPhone] || b.amount > map[b.userPhone].amount) {
        map[b.userPhone] = { name: b.userName, phone: b.userPhone, amount: b.amount };
      }
    });
    return Object.values(map).sort(function (a, b) { return b.amount - a.amount; });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render() {
    var q = searchTerm.trim().toLowerCase();
    var rows = books.filter(function (b) {
      return (statusFilter === 'all' || b.status === statusFilter) &&
        (!q || b.title.toLowerCase().indexOf(q) !== -1 || b.author.toLowerCase().indexOf(q) !== -1 || b.genre.toLowerCase().indexOf(q) !== -1);
    });
    rows.sort(function (a, b) {
      var av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') return av.localeCompare(bv) * sortDir;
      return (av - bv) * sortDir;
    });

    tbody.innerHTML = '';
    rows.forEach(function (b) {
      var tr = document.createElement('tr');
      tr.className = 'book-row';
      tr.dataset.id = b.id;
      var rise = b.currentPrice - b.startingPrice;
      tr.innerHTML =
        '<td><img class="cover" src="' + escapeHtml(b.coverImageUrl) + '" alt=""></td>' +
        '<td><div style="font-weight:600">' + escapeHtml(b.title) + '</div><div style="color:var(--muted);font-size:.78rem">' + escapeHtml(b.author) + '</div></td>' +
        '<td>' + escapeHtml(b.genre) + '</td>' +
        '<td>' + b.bidCount + ' <span style="color:var(--muted)">(' + b.bidderCount + ' хүн)</span></td>' +
        '<td>♥ ' + b.wishlistCount + '</td>' +
        '<td>' + money(b.currentPrice) + (rise > 0 ? '<div class="rise">▲ ' + money(rise) + '</div>' : '') + '</td>' +
        '<td><span class="badge ' + b.status + '">' + statusLabel(b.status) + '</span></td>';
      tbody.appendChild(tr);

      tr.addEventListener('click', function () {
        var existing = tr.nextElementSibling;
        var isOpen = existing && existing.classList.contains('detail-row');
        if (openRow) { openRow.remove(); openRow = null; }
        if (isOpen) return;
        var bidders = bidderListFor(b.id);
        var detail = document.createElement('tr');
        detail.className = 'detail-row';
        var inner = bidders.length
          ? bidders.map(function (bd, i) {
              return '<div class="bidder"><span>' + (i + 1) + '. ' + escapeHtml(bd.name) + ' <span style="color:var(--muted)">' + escapeHtml(bd.phone) + '</span></span><span style="font-weight:700">' + money(bd.amount) + '</span></div>';
            }).join('')
          : '<p class="detail-empty">Энэ номонд санал ирээгүй байна.</p>';
        detail.innerHTML = '<td colspan="7"><div class="detail-inner">' + inner + '</div></td>';
        tr.after(detail);
        openRow = detail;
      });
    });
  }

  document.querySelectorAll('th[data-key]').forEach(function (th) {
    th.addEventListener('click', function () {
      var key = th.dataset.key;
      if (sortKey === key) sortDir *= -1; else { sortKey = key; sortDir = -1; }
      render();
    });
  });
  document.getElementById('search').addEventListener('input', function (e) {
    searchTerm = e.target.value;
    render();
  });
  document.querySelectorAll('.toolbar button.chip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.toolbar button.chip').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      statusFilter = btn.dataset.status;
      render();
    });
  });

  render();

  // ---- scroll reveal + count-up ----
  var counted = new WeakSet();
  function animateCount(el) {
    if (counted.has(el)) return;
    counted.add(el);
    var target = Number(el.dataset.target) || 0;
    var isMoney = el.dataset.money === '1';
    var start = performance.now();
    var dur = 1100;
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = isMoney ? val.toLocaleString('en-US') : val.toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        var num = entry.target.classList.contains('stat-card') || entry.target.classList.contains('hero-stat')
          ? entry.target.querySelector('[data-target]')
          : entry.target.querySelector && entry.target.dataset.target !== undefined ? entry.target : null;
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  document.querySelectorAll('.hero-stat .num, .stat-card .num').forEach(function (el) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); obs.disconnect(); }
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  });
  // hero stats + their numbers aren't wrapped in .reveal, fade them in directly
  document.querySelectorAll('.hero-stat').forEach(function (el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .6s ease ' + (i * 0.1) + 's, transform .6s ease ' + (i * 0.1) + 's';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'none'; });
    });
  });

  // ---- nav dots scrollspy ----
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#navdots a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var idx = sections.indexOf(entry.target);
      if (idx === -1) return;
      if (entry.isIntersecting) {
        navLinks.forEach(function (a) { a.classList.remove('active'); });
        navLinks[idx].classList.add('active');
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(function (s) { if (s) navObserver.observe(s); });
})();
`;
