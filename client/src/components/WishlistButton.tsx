import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistButton({
  bookId,
  size = 'md',
  className = '',
}: {
  bookId: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { user, openSignIn } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const active = isWishlisted(bookId);
  const dimension = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 16 : 20;

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openSignIn();
      return;
    }
    void toggle(bookId);
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.8 }}
      aria-label={active ? 'Хадгалснаас хасах' : 'Хадгалах'}
      className={`flex ${dimension} items-center justify-center rounded-full bg-navy-950/60 backdrop-blur-sm transition ${className}`}
    >
      <motion.svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        animate={{ scale: active ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.3 }}
        fill={active ? '#ff7a1a' : 'none'}
        stroke={active ? '#ff7a1a' : '#fff'}
        strokeWidth="2"
      >
        <path d="M12 21s-6.7-4.35-9.3-8.2C1 10.1 1.6 6.6 4.4 5.1c2.3-1.2 4.9-.4 6.2 1.5l1.4 2 1.4-2c1.3-1.9 3.9-2.7 6.2-1.5 2.8 1.5 3.4 5 1.7 7.7C18.7 16.65 12 21 12 21z" />
      </motion.svg>
    </motion.button>
  );
}
