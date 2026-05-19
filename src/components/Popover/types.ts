import type { CSSProperties, HTMLAttributes, ReactNode, RefObject } from 'react';

// ─── Placement ───────────────────────────────────────────────────────────────

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

// ─── Arrow ────────────────────────────────────────────────────────────────────

export interface ArrowOptions {
  /** Show arrow pointer. @default true */
  enabled?: boolean;
  /** Arrow size in px. @default 8 */
  size?: number;
  /** Extra padding from anchor edge corners. @default 6 */
  padding?: number;
}

// ─── Offset ───────────────────────────────────────────────────────────────────

export interface PopoverOffset {
  /** Distance from anchor (main axis). @default 8 */
  mainAxis?: number;
  /** Shift along the cross axis. @default 0 */
  crossAxis?: number;
}

// ─── Transitions ─────────────────────────────────────────────────────────────

export type PopoverTransition = 'fade' | 'scale' | 'shift' | 'none';

// ─── Main Props ───────────────────────────────────────────────────────────────

export interface PopoverProps {
  /** Anchor element or ref that the popover is positioned relative to. */
  anchorEl: HTMLElement | RefObject<HTMLElement | null> | null;

  /** Controls open state. */
  open: boolean;

  /** Preferred placement. Flips automatically if out of viewport. @default 'bottom' */
  placement?: PopoverPlacement;

  /** Pixel offsets from anchor. */
  offset?: PopoverOffset;

  /** Arrow configuration. */
  arrow?: ArrowOptions | boolean;

  /** Entry / exit transition. @default 'scale' */
  transition?: PopoverTransition;

  /** Transition duration in ms. @default 200 */
  transitionDuration?: number;

  /** Keep the popover mounted in DOM when closed (for perf-critical cases). @default false */
  keepMounted?: boolean;

  /** Close when clicking outside. @default true */
  closeOnOutsideClick?: boolean;

  /** Close on Escape key. @default true */
  closeOnEscape?: boolean;

  /** Whether to portal into document.body. @default true */
  disablePortal?: boolean;

  /** Extra class on the popover root. */
  className?: string;

  /** Inline styles on the popover root. */
  style?: CSSProperties;

  /** zIndex override. @default 1300 */
  zIndex?: number;

  /** Called when popover requests to close (outside click / Escape). */
  onClose?: () => void;

  /** Called after open transition ends. */
  onOpen?: () => void;

  children: ReactNode;
}

// ─── Computed position result ─────────────────────────────────────────────────

export interface ComputedPosition {
  top: number;
  left: number;
  placement: PopoverPlacement;
  arrowTop: number | undefined;
  arrowLeft: number | undefined;
}

// ─── Arrow element props ──────────────────────────────────────────────────────

export interface ArrowElementProps extends HTMLAttributes<HTMLSpanElement> {
  placement: PopoverPlacement;
  size: number;
  arrowTop: number | undefined;
  arrowLeft: number | undefined;
}
