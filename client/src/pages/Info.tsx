import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const JOURNEY_ICONS = {
  book: (
    <>
      <path d="M12 6.5C10.3 5.1 7.8 4.6 4 5v13.5c3.8-.5 6.3 0 8 1.5 1.7-1.5 4.2-2 8-1.5V5c-3.8-.5-6.3 0-8 1.5z" />
      <path d="M12 6.5v13.5" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="1.5" />
      <path d="M3 13h18" />
      <path d="M12 9v12" />
      <path d="M12 9c-1.2-3.5-3.4-5-5-5-1.4 0-2.3 1-2.3 2.2C4.7 7.7 6 9 12 9z" />
      <path d="M12 9c1.2-3.5 3.4-5 5-5 1.4 0 2.3 1 2.3 2.2C19.3 7.7 18 9 12 9z" />
    </>
  ),
  graduationCap: (
    <>
      <path d="m2 8 10-5 10 5-10 5-10-5z" />
      <path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5" />
      <path d="M22 8v6" />
    </>
  ),
} as const;

function JourneyIcon({ name }: { name: keyof typeof JOURNEY_ICONS }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
    >
      {JOURNEY_ICONS[name]}
    </svg>
  );
}

function JourneyStep({ icon, label }: { icon: keyof typeof JOURNEY_ICONS; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-surface p-4 text-center shadow-sm ring-1 ring-border">
      <JourneyIcon name={icon} />
      <p className="text-xs font-semibold leading-snug text-fg sm:text-sm">{label}</p>
    </div>
  );
}

function JourneyArrow() {
  return (
    <span className="mx-auto shrink-0 rotate-90 text-2xl text-accent sm:rotate-0" aria-hidden="true">
      →
    </span>
  );
}

function JourneyDiagram() {
  return (
    <div className="mx-auto grid max-w-sm grid-cols-[1fr_2.5rem_1fr] gap-y-6">
      <div className="col-start-1 row-start-1 row-span-2 flex items-center">
        <JourneyStep icon="book" label="Чиний уншсан ном" />
      </div>
      <svg
        className="col-start-2 row-start-1 row-span-2 block h-full w-full text-accent"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M0 50 L45 50 L100 18" />
        <path d="M0 50 L45 50 L100 82" />
      </svg>
      <div className="col-start-3 row-start-1">
        <JourneyStep icon="gift" label="Өөр хүний шинэ ертөнц" />
      </div>
      <div className="col-start-3 row-start-2">
        <JourneyStep icon="graduationCap" label="Хүүхдийн шинэ боломж" />
      </div>
    </div>
  );
}

export default function Info() {
  return (
    <>
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
          Афлатон номын аян гэж юу вэ?
        </h1>
      </motion.div>

      <div className="mt-10 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/10 via-surface to-surface p-8 sm:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-navy-400/10 blur-3xl" />
          <div className="relative">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
              <div className="text-center lg:text-left">
                <h2 className="mt-2 font-display text-2xl font-bold text-fg sm:text-3xl">Аяны тухай мэдээлэл</h2>

                <blockquote className="mx-auto mt-4 max-w-lg border-l-4 border-accent pl-4 text-left lg:mx-0">
                  <p className="font-display text-xl italic text-fg sm:text-2xl">
                    Уншсан номоо хуваалцъя, <span className="text-accent">мэдлэгээр давалгаалъя.</span>
                  </p>
                </blockquote>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted sm:text-base lg:mx-0">
                  Нэгэн цагт таны ном танд өөр нэг ертөнцийн хаалгыг нээж байсан. Түүнийг хандивлах мөчид та тэр
                  ертөнцийг дараагийн уншигчид илгээж, харин худалдаж авахдаа өөр хэн нэгний үлдээсэн ертөнцийг сонгон
                  аяллыг нь дахин эхлүүлнэ.
                </p>
              </div>

              <div>
                <div className="hidden lg:block">
                  <JourneyDiagram />
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:hidden">
                  <JourneyStep icon="gift" label="Өөр хүний шинэ ертөнц" />
                  <JourneyArrow />
                  <JourneyStep icon="graduationCap" label="Хүүхдийн шинэ боломж" />
                  <JourneyArrow />
                  <JourneyStep icon="book" label="Чиний уншсан ном" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-surface-2 p-5 text-center sm:flex-row sm:text-left">
              <span className="font-display text-4xl font-bold text-accent">100%</span>
              <p className="text-sm leading-snug text-muted">
                Номын худалдааны орлого <strong className="font-semibold text-fg">Афлатон хөтөлбөрийн</strong>{' '}
                хүүхдүүдийн сургалтын материал, хэрэглэгдэхүүнд зарцуулагдана.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-10"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative grid grid-cols-1 items-center gap-6 text-center sm:grid-cols-[auto_1fr] sm:text-left">
            <img src="/logoDark.png" alt="Хөгжлийн Алтан Сан" className="mx-auto h-20 w-auto dark:hidden sm:mx-0 sm:h-24" />
            <img src="/logo.png" alt="Хөгжлийн Алтан Сан" className="mx-auto hidden h-20 w-auto dark:block sm:mx-0 sm:h-24" />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Зохион байгуулагч</span>
              <h2 className="mt-2 font-display text-2xl font-bold text-fg sm:text-3xl">Зохион байгуулагчийн талаар мэдээлэл</h2>

              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-fg">2003 оноос хойш</span>
                <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-fg">XacBank-ны дэмжлэгтэй</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Aflatoun</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">XacLab</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Тэтгэлэг</span>
              </div>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted sm:mx-0 sm:text-base">
                "Хөгжлийн Алтан Сан" Холбоо хүүхэд, залуучуудад ирээдүйд ажиллаж, амьдрахад шаардлагатай санхүүгийн
                боловсрол, хөгжлийн боломжийг олгохыг эрхэм зорилгоо болгодог төрийн бус байгууллага юм.
              </p>
              <a
                href="https://xacngo.mn/about-us"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
              >
                Дэлгэрэнгүй үзэх →
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10 flex flex-col items-center gap-2 text-center"
      >
        <p className="text-sm text-muted"></p>
        <Link
          to="/library"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-glow transition hover:brightness-110"
        >
          Номын сан руу очих
        </Link>
      </motion.div>
    </div>
    <Footer />
    </>
  );
}
