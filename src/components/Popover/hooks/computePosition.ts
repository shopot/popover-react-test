import type {
  ArrowOptions,
  ComputedPosition,
  PopoverOffset,
  PopoverPlacement,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FLIP_MAP: Record<PopoverPlacement, PopoverPlacement> = {
  top: 'bottom',
  'top-start': 'bottom-start',
  'top-end': 'bottom-end',
  bottom: 'top',
  'bottom-start': 'top-start',
  'bottom-end': 'top-end',
  left: 'right',
  'left-start': 'right-start',
  'left-end': 'right-end',
  right: 'left',
  'right-start': 'left-start',
  'right-end': 'left-end',
};

type Side = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'end' | 'center';

function parsePlacement(placement: PopoverPlacement): { side: Side; align: Align } {
  const [side, align = 'center'] = placement.split('-') as [Side, Align | undefined];
  return { side, align: align ?? 'center' };
}

// ─── Core computation ─────────────────────────────────────────────────────────

export interface ComputePositionArgs {
  anchorRect: DOMRect;
  popoverWidth: number;
  popoverHeight: number;
  placement: PopoverPlacement;
  offset: Required<PopoverOffset>;
  arrow: Required<ArrowOptions>;
  viewportWidth: number;
  viewportHeight: number;
  scrollX: number;
  scrollY: number;
}

/**
 * Pure function – no DOM access. Computes absolute (document-relative) top/left
 * for the popover and the arrow position within the popover.
 */
export function computePosition(args: ComputePositionArgs): ComputedPosition {
  const {
    anchorRect,
    popoverWidth,
    popoverHeight,
    placement: preferredPlacement,
    offset,
    arrow,
    viewportWidth,
    viewportHeight,
    scrollX,
    scrollY,
  } = args;

  const arrowSize = arrow.enabled ? arrow.size : 0;
  const mainAxisGap = offset.mainAxis + arrowSize;

  const placements: PopoverPlacement[] = [preferredPlacement, FLIP_MAP[preferredPlacement]];

  for (let attempt = 0; attempt < placements.length; attempt++) {
    const placement = placements[attempt];
    const { side, align } = parsePlacement(placement);

    // ── Anchor edges (absolute) ──────────────────────────────────────────────
    const anchorTop = anchorRect.top + scrollY;
    const anchorBottom = anchorRect.bottom + scrollY;
    const anchorLeft = anchorRect.left + scrollX;
    const anchorRight = anchorRect.right + scrollX;
    const anchorCenterX = anchorLeft + anchorRect.width / 2;
    const anchorCenterY = anchorTop + anchorRect.height / 2;

    let top = 0;
    let left = 0;

    // ── Main axis ────────────────────────────────────────────────────────────
    switch (side) {
      case 'top':
        top = anchorTop - popoverHeight - mainAxisGap;
        break;
      case 'bottom':
        top = anchorBottom + mainAxisGap;
        break;
      case 'left':
        left = anchorLeft - popoverWidth - mainAxisGap;
        break;
      case 'right':
        left = anchorRight + mainAxisGap;
        break;
    }

    // ── Cross axis ───────────────────────────────────────────────────────────
    if (side === 'top' || side === 'bottom') {
      switch (align) {
        case 'start':
          left = anchorLeft + offset.crossAxis;
          break;
        case 'end':
          left = anchorRight - popoverWidth + offset.crossAxis;
          break;
        default:
          left = anchorCenterX - popoverWidth / 2 + offset.crossAxis;
      }
    } else {
      switch (align) {
        case 'start':
          top = anchorTop + offset.crossAxis;
          break;
        case 'end':
          top = anchorBottom - popoverHeight + offset.crossAxis;
          break;
        default:
          top = anchorCenterY - popoverHeight / 2 + offset.crossAxis;
      }
    }

    // ── Viewport containment check (only flip on first attempt) ──────────────
    if (attempt === 0) {
      const fitsVertically = top - scrollY >= 0 && top - scrollY + popoverHeight <= viewportHeight;
      const fitsHorizontally =
        left - scrollX >= 0 && left - scrollX + popoverWidth <= viewportWidth;

      const isVerticalSide = side === 'top' || side === 'bottom';
      const fits = isVerticalSide ? fitsVertically : fitsHorizontally;

      if (!fits) {
        // Try the flipped placement on next iteration
        continue;
      }
    }

    // ── Arrow position ───────────────────────────────────────────────────────
    let arrowTop: number | undefined;
    let arrowLeft: number | undefined;

    if (arrow.enabled) {
      const minArrowOffset = arrow.padding + arrowSize;

      if (side === 'top' || side === 'bottom') {
        // Arrow horizontal position within popover
        const anchorCenterXRelative = anchorCenterX - left;
        arrowLeft = Math.max(
          minArrowOffset,
          Math.min(anchorCenterXRelative - arrowSize / 2, popoverWidth - minArrowOffset - arrowSize),
        );
      } else {
        // Arrow vertical position within popover
        const anchorCenterYRelative = anchorCenterY - top;
        arrowTop = Math.max(
          minArrowOffset,
          Math.min(anchorCenterYRelative - arrowSize / 2, popoverHeight - minArrowOffset - arrowSize),
        );
      }
    }

    return { top, left, placement, arrowTop, arrowLeft };
  }

  // Fallback – should never reach here in practice
  return {
    top: 0,
    left: 0,
    placement: preferredPlacement,
    arrowTop: undefined,
    arrowLeft: undefined,
  };
}
