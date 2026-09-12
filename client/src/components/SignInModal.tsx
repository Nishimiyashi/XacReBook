import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

export default function SignInModal() {
  const { isModalOpen, closeSignIn, signIn } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(name, phone);
      setName('');
      setPhone('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Алдаа гарлаа');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeSignIn();
          }}
        >
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <motion.img
              src="/login.png"
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 260, damping: 20 }}
              className="pointer-events-none absolute -top-[4.5rem] left-4 z-0 h-20 w-20"
            />

            <div className="relative z-10 rounded-2xl border border-border bg-surface p-8 shadow-2xl">
              <button
                onClick={closeSignIn}
                aria-label="Хаах"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              <h2 className="mb-6 text-center font-display text-2xl font-bold text-fg">Нэвтрэх</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Нэр</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Нэрээ бичнэ үү"
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Утасны дугаар</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    type="tel"
                    placeholder="********"
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
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
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
