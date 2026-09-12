import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    icon: '📖',
    title: 'Чөлөөтэй үзээрэй',
    body: 'Нэвтрэлгүйгээр номын сан болон бүх номын дэлгэрэнгүй мэдээллийг чөлөөтэй үзэх боломжтой.',
  },
  {
    icon: '✍️',
    title: 'Үнэ хэлэхэд нэвтэрнэ',
    body: 'Үнэ хэлэхийн тулд зөвхөн нэр, утасны дугаараа оруулна — маш хурдан бөгөөд энгийн.',
  },
  {
    icon: '🏆',
    title: 'Хамгийн өндөр үнэ хэлсэн нь ялна',
    body: 'Дуудлага худалдаа дуусах үед хамгийн өндөр үнэ хэлсэн хүн номыг эзэмшинэ.',
  },
];

export default function Info() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col justify-center px-4 py-10 sm:px-6 lg:h-[calc(100vh-4rem)] lg:py-0">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          Мэдээлэл
        </span>
        <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
          XacReBook хэрхэн ажилладаг вэ?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">
          Ном тус бүрийг дуудлага худалдаагаар зардаг цахим үйлчилгээ. Хэрхэн оролцохыг доор харна уу.
        </p>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="rounded-2xl border border-border bg-surface p-5 text-center"
          >
            <span className="mb-2 block text-3xl">{step.icon}</span>
            <h2 className="font-display text-lg font-bold text-fg">{step.title}</h2>
            <p className="mt-1 text-sm text-muted">{step.body}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex flex-col items-center gap-2 text-center"
      >
        <p className="text-sm text-muted">Бэлэн үү? Одоо номын сангаас хайж эхлээрэй.</p>
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
