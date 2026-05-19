import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import type {
  ArrowOptions,
  PopoverOffset,
  PopoverPlacement,
  PopoverProps,
  PopoverTransition,
} from './types';

import { usePopoverPosition } from './hooks/usePopoverPosition';
import { useOutsideClick, useEscapeKey } from './hooks/useInteractionHandlers';
import { Portal } from './components/Portal';
import { PopoverArrow } from './components/PopoverArrow';
import styles from './Popover.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_OFFSET: Required<PopoverOffset> = { mainAxis: 8, crossAxis: 0 };
const DEFAULT_ARROW: Required<ArrowOptions> = { enabled: true, size: 8, padding: 6 };

// ─── Transform origin map ─────────────────────────────────────────────────────

const TRANSFORM_ORIGIN: Record<PopoverPlacement, string> = {
  top: 'bottom center',
  'top-start': 'bottom left',
  'top-end': 'bottom right',
  bottom: 'top center',
  'bottom-start': 'top left',
  'bottom-end': 'top right',
  left: 'center right',
  'left-start': 'top right',
  'left-end': 'bottom right',
  right: 'center left',
  'right-start': 'top left',
  'right-end': 'bottom left',
};

// ─── Transition state machine ─────────────────────────────────────────────────

type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

function useTransitionState(
  open: boolean,
  duration: number,
  transition: PopoverTransition,
  readyToEnter: boolean,
): { state: TransitionState; mounted: boolean } {
  const [state, setState] = useState<TransitionState>(open ? 'entered' : 'exited');
  const [mounted, setMounted] = useState(open);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      if (!readyToEnter) return;

      const id1 = setTimeout(() => setState('entering'), 0);
      const id2 = setTimeout(
        () => setState('entered'),
        transition === 'none' ? 0 : duration,
      );
      timerRef.current = id2;
      return () => {
        clearTimeout(id1);
        clearTimeout(id2);
      };
    } else {
      setState('exiting');
      const id = setTimeout(
        () => {
          setState('exited');
          setMounted(false);
        },
        transition === 'none' ? 0 : duration,
      );
      timerRef.current = id;
      return () => clearTimeout(id);
    }
  }, [open, duration, transition, readyToEnter]);

  return { state, mounted };
}

// ─── Resolve helpers ──────────────────────────────────────────────────────────

function resolveArrow(arrow: PopoverProps['arrow']): Required<ArrowOptions> {
  if (arrow === false) return { ...DEFAULT_ARROW, enabled: false };
  if (arrow === true || arrow === undefined) return DEFAULT_ARROW;
  return { ...DEFAULT_ARROW, ...arrow };
}

function resolveAnchorEl(
  anchorEl: HTMLElement | RefObject<HTMLElement | null> | null,
): HTMLElement | null {
  if (!anchorEl) return null;
  if (anchorEl instanceof HTMLElement) return anchorEl;
  return anchorEl.current ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    anchorEl: anchorElProp,
    open,
    placement: preferredPlacement = 'bottom',
    offset: offsetProp,
    arrow: arrowProp,
    transition = 'scale',
    transitionDuration = 200,
    keepMounted = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    disablePortal = false,
    className,
    style,
    zIndex = 1300,
    onClose,
    onOpen,
    children,
  },
  ref,
) {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => popoverRef.current as HTMLDivElement);

  const anchorEl = resolveAnchorEl(anchorElProp);
  const arrowOptions = resolveArrow(arrowProp);
  const offset: Required<PopoverOffset> = { ...DEFAULT_OFFSET, ...offsetProp };

  // ── Position ──────────────────────────────────────────────────────────────
  const { top, left, placement, arrowTop, arrowLeft, isPositioned } = usePopoverPosition({
    anchorEl,
    popoverRef,
    placement: preferredPlacement,
    offset,
    arrow: arrowOptions,
    open,
  });

  // ── Transition ────────────────────────────────────────────────────────────
  const { state, mounted } = useTransitionState(
    open,
    transitionDuration,
    transition,
    isPositioned,
  );

  // Notify parent when fully open
  useEffect(() => {
    if (state === 'entered' && open) onOpen?.();
  }, [state, open, onOpen]);

  // ── Interaction handlers ──────────────────────────────────────────────────
  const anchorRef = useRef<HTMLElement | null>(anchorEl);
  useLayoutEffect(() => {
    anchorRef.current = anchorEl;
  }, [anchorEl]);

  const handleClose = useCallback(() => {
    if (open) onClose?.();
  }, [open, onClose]);

  useOutsideClick(
    [popoverRef, anchorRef as RefObject<HTMLElement>],
    handleClose,
    open && closeOnOutsideClick,
  );

  useEscapeKey(handleClose, open && closeOnEscape);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!mounted && !keepMounted) return null;

  const transformOrigin = TRANSFORM_ORIGIN[placement];

  // KEY FIX: never use top/left from the "not yet positioned" state for
  // visibility logic. Instead, hide only while waiting for the FIRST
  // measurement on open (before isPositioned). During closing (open=false,
  // mounted=true) the position is already known and stable — do NOT hide it,
  // or the exit animation will flash to (0,0) before unmounting.
  const hideWhileMeasuring = open && !isPositioned;

  const rootStyle: CSSProperties = {
    top,
    left,
    zIndex,
    '--popover-transition-duration': `${transitionDuration}ms`,
    '--popover-transform-origin': transformOrigin,
    // Only hide while awaiting the very first measurement on open.
    // opacity:0 is used instead of visibility:hidden so the element stays
    // measurable (offsetWidth/offsetHeight return real values).
    ...(hideWhileMeasuring ? { opacity: 0, pointerEvents: 'none' } : {}),
    ...style,
  } as CSSProperties;

  const classNames = [
    styles.root,
    styles[`transition-${transition}`],
    styles[state],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Portal disabled={disablePortal}>
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal={false}
        data-placement={placement}
        className={classNames}
        style={rootStyle}
        tabIndex={-1}
      >
        <div className={styles.content}>{children}</div>

        {arrowOptions.enabled && (
          <PopoverArrow
            placement={placement}
            size={arrowOptions.size}
            arrowTop={arrowTop}
            arrowLeft={arrowLeft}
          />
        )}
      </div>
    </Portal>
  );
});

Popover.displayName = 'Popover';