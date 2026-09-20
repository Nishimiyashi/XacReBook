import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const positions = new Map<string, number>();

// The router doesn't handle scroll on its own: a new page inherits the old
// page's scroll offset, and going back lands at the top. Fresh navigations
// start at the top; back/forward returns to where the user was, retrying
// briefly in case the page is still filling in with data.
export default function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const key = location.key;
    const onScroll = () => positions.set(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.key]);

  useLayoutEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
      return;
    }

    const target = positions.get(location.key) ?? 0;
    if (target === 0) {
      window.scrollTo(0, 0);
      return;
    }

    let frame = 0;
    let attempts = 0;
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    window.addEventListener('wheel', cancel, { passive: true, once: true });
    window.addEventListener('touchstart', cancel, { passive: true, once: true });

    const tryRestore = () => {
      if (cancelled) return;
      window.scrollTo(0, target);
      attempts += 1;
      if (Math.abs(window.scrollY - target) > 2 && attempts < 90) {
        frame = requestAnimationFrame(tryRestore);
      }
    };
    tryRestore();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
    };
  }, [location.key, navType]);

  return null;
}
