import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Info() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          Мэдээлэл
        </span>
        <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
          Афлатон номын аян гэж юу вэ?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">
          Аяны болон зохион байгуулж буй байгууллагын талаар дэлгэрэнгүй мэдээлэл.
        </p>
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
          <div className="relative text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Тухай</span>
            <h2 className="mt-2 font-display text-2xl font-bold text-fg sm:text-3xl">Аяны тухай мэдээлэл</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted sm:mx-0 sm:text-base">
              Энэ аяны зорилго, хамрах хүрээ болон түүх гэх мэтийн талаарх дэлгэрэнгүй мэдээллийг энд оруулна.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 sm:p-10"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative grid grid-cols-1 items-center gap-6 text-center sm:grid-cols-[auto_1fr] sm:text-left">
            <img src="/logo.png" alt="Хөгжлийн Алтан Сан" className="mx-auto h-20 w-auto sm:mx-0 sm:h-24" />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Зохион байгуулагч</span>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">Зохион байгуулагчийн талаар мэдээлэл</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-navy-100/80 sm:mx-0 sm:text-base">
                "Хөгжлийн Алтан Сан" Холбоо нь 2003 оноос хойш үйл ажиллагаа явуулж буй, XacBank-ны ажилтнуудын дэмжлэгтэй төрийн бус байгууллага юм. Тэд хүүхэд, залуучуудад ирээдүйд ажиллаж, амьдрахад шаардлагатай санхүүгийн боловсрол, хөгжлийн боломжийг олгохыг эрхэм зорилгоо болгодог. Aflatoun, XacLab зэрэг хөтөлбөрүүд, мөн авьяаслаг ч санхүүгийн бэрхшээлтэй залуучуудад зориулсан тэтгэлгийн хөтөлбөрүүдээр дамжуулан энэ зорилгодоо хүрэхийг зорьдог.
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
        <p className="text-sm text-muted">Бэлэн үү?</p>
        <Link
          to="/library"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-glow transition hover:brightness-110"
        >
          Номын сан руу очих
        </Link>
      </motion.div>
    </div>
  );
}
