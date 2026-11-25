/**
 * Utility to merge conditional CSS class names cleanly without external heavy dependencies.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
