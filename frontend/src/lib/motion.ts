export const MOTION_DURATIONS = {
  fast: 0.12,
  base: 0.20,
  slow: 0.30,
};

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const MOTION_SPRING = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
};

const REDUCE_MOTION_STORAGE_KEY = 'prism.reduceMotion';

export function getInitialReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;

  const saved = localStorage.getItem(REDUCE_MOTION_STORAGE_KEY);
  if (saved !== null) {
    return saved === 'true';
  }

  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function applyReduceMotion(reduce: boolean): void {
  if (typeof document === 'undefined') return;
  if (reduce) {
    document.documentElement.setAttribute('data-reduce-motion', 'true');
  } else {
    document.documentElement.removeAttribute('data-reduce-motion');
  }
  try {
    localStorage.setItem(REDUCE_MOTION_STORAGE_KEY, String(reduce));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}
