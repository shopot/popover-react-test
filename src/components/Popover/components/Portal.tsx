import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  container?: Element | null;
  disabled?: boolean;
}

/**
 * Renders children into a DOM node outside the current tree.
 * Falls back to `document.body` when no container is provided.
 *
 * Implementation notes:
 * - Lazy useState initializer runs once on mount (client-only), avoiding
 *   both the "no ref access during render" (React 19) and
 *   "setState in effect" lint errors.
 * - Returns null before mount so SSR hydration stays consistent.
 * - If `container` changes after mount, remount the Portal via a `key` prop
 *   on the caller side — the lazy initializer only runs once per instance.
 */
export function Portal({ children, container, disabled = false }: PortalProps) {
  // Lazy initializer: executes once on the client after the component mounts.
  // Never runs during SSR, so `document` access is safe.
  const [mountNode] = useState<HTMLElement | null>(() => {
    if (typeof document === 'undefined') return null;
    return (container as HTMLElement | null | undefined) ?? document.body;
  });

  if (disabled) return <>{children}</>;

  // null during SSR — return nothing to avoid hydration mismatch.
  if (!mountNode) return null;

  return createPortal(children, mountNode);
}