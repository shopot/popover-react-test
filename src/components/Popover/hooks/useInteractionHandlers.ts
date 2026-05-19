import { useEffect } from 'react';

/**
 * Calls `handler` when a pointer/mouse event occurs outside all `refs`.
 */
export function useOutsideClick(
  refs: Array<React.RefObject<HTMLElement | null>>,
  handler: (event: PointerEvent) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const isInside = refs.some((ref) => ref.current?.contains(target));
      if (!isInside) handler(event);
    };

    // Use `pointerdown` so we catch touch as well
    document.addEventListener('pointerdown', listener, { capture: true });
    return () => document.removeEventListener('pointerdown', listener, { capture: true });
  }, [refs, handler, enabled]);
}

/**
 * Calls `handler` when the Escape key is pressed.
 */
export function useEscapeKey(handler: (event: KeyboardEvent) => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler(event);
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [handler, enabled]);
}
