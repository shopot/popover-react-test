import { useCallback, useEffect, useRef, useState } from 'react';
import { computePosition } from './computePosition';
import type { ArrowOptions, ComputedPosition, PopoverOffset, PopoverPlacement } from '../types';

interface UsePopoverPositionArgs {
  anchorEl: HTMLElement | null;
  popoverRef: React.RefObject<HTMLElement | null>;
  placement: PopoverPlacement;
  offset: Required<PopoverOffset>;
  arrow: Required<ArrowOptions>;
  open: boolean;
}

export interface UsePopoverPositionResult extends ComputedPosition {
  isPositioned: boolean;
}

export function usePopoverPosition({
  anchorEl,
  popoverRef,
  placement,
  offset,
  arrow,
  open,
}: UsePopoverPositionArgs): UsePopoverPositionResult {
  const [position, setPosition] = useState<ComputedPosition | null>(null);
  const measuredForSessionRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  const measure = useCallback((): ComputedPosition | null => {
    if (!anchorEl || !popoverRef.current) return null;
    return computePosition({
      anchorRect: anchorEl.getBoundingClientRect(),
      popoverWidth: popoverRef.current.offsetWidth,
      popoverHeight: popoverRef.current.offsetHeight,
      placement,
      offset,
      arrow,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    });
  }, [anchorEl, popoverRef, placement, offset, arrow]);

  const scheduleUpdate = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const result = measure();
      if (result) setPosition(result);
    });
  }, [measure]);

  useEffect(() => {
    if (!open) {
      measuredForSessionRef.current = false;
      // Cancel any pending rAF — its setState would land on a closed popover
      // and produce a stale (0,0) flash on the next open cycle.
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      return;
    }

    const ro = new ResizeObserver(() => {
      if (!measuredForSessionRef.current) {
        measuredForSessionRef.current = true;
        const result = measure();
        if (result) setPosition(result);
      } else {
        scheduleUpdate();
      }
    });

    if (anchorEl) ro.observe(anchorEl);
    if (popoverRef.current) ro.observe(popoverRef.current);

    window.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', scheduleUpdate, { capture: true });
      window.removeEventListener('resize', scheduleUpdate);
      // Cleanup cancels any in-flight rAF — no stale setState can fire after this.
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [open, anchorEl, popoverRef, measure, scheduleUpdate]);

  if (position === null) {
    return {
      top: 0,
      left: 0,
      placement,
      arrowTop: undefined,
      arrowLeft: undefined,
      isPositioned: false,
    };
  }

  return {
    top: position.top,
    left: position.left,
    placement: position.placement,
    arrowTop: position.arrowTop,
    arrowLeft: position.arrowLeft,
    isPositioned: true,
  };
}