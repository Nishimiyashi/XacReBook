import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '../types';
import { formatPrice } from '../lib/format';

const TROPHY_STYLES: Record<LeaderboardEntry['trophy'], { icon: string; ring: string; label: string }> = {
  gold: { icon: '/gold.png', ring: 'ring-yellow-400/70 bg-yellow-400/10', label: 'Top bidder' },
  silver: { icon: '/silver.png', ring: 'ring-slate-300/70 bg-slate-300/10', label: 'Chaser' },
  bronze: { icon: '/bronze.png', ring: 'ring-orange-400/70 bg-orange-400/10', label: 'Challenger' },
};

export default function TrophyBadge({ entry, index = 0 }: { entry: LeaderboardEntry; index?: number }) {
  const style = TROPHY_STYLES[entry.trophy];
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`flex items-center justify-between gap-3 rounded-xl border border-border p-3 ring-1 ${style.ring}`}
    >
      <div className="flex items-center gap-3">
        <img src={style.icon} alt={style.label} className="h-9 w-9 shrink-0 object-contain" />
        <div>
          <p className="text-sm font-semibold text-fg">{entry.name}</p>
          <p className="text-xs font-semibold tracking-wide text-muted">{style.label}</p>
        </div>
      </div>
      <span className="font-display text-sm font-bold text-accent">{formatPrice(entry.amount)}</span>
    </motion.div>
  );
}
