/**
 * Vanilla scroll bridge — lets the 3D Canvas (which can't use Framer Motion hooks)
 * read the page scroll position. Page writes via useMotionValueEvent,
 * Scene reads in useFrame via scrollProgress.get().
 */

let _value = 0;
const _listeners: Array<(v: number) => void> = [];

export const scrollProgress = {
  get: () => _value,
  set: (v: number) => {
    _value = v;
    for (const fn of _listeners) fn(v);
  },
  subscribe: (fn: (v: number) => void) => {
    _listeners.push(fn);
    return () => {
      const idx = _listeners.indexOf(fn);
      if (idx >= 0) _listeners.splice(idx, 1);
    };
  },
};
