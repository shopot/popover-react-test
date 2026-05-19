import { type CSSProperties, forwardRef } from 'react';
import type { ArrowElementProps } from '../types';
import type { PopoverPlacement } from '../types';
import styles from '../Popover.module.css';

function getArrowStyle(
  placement: PopoverPlacement,
  size: number,
  arrowTop: number | undefined,
  arrowLeft: number | undefined,
): CSSProperties {
  const side = placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';

  const base: CSSProperties = {
    '--popover-arrow-size': `${size}px`,
    position: 'absolute',
  } as CSSProperties;

  switch (side) {
    case 'top':
      return {
        ...base,
        bottom: -(size - 1),
        left: arrowLeft,
        transform: 'rotate(180deg)',
      };
    case 'bottom':
      return {
        ...base,
        top: -(size - 1),
        left: arrowLeft,
        transform: 'rotate(0deg)',
      };
    case 'left':
      return {
        ...base,
        right: -(size - 1),
        top: arrowTop,
        transform: 'rotate(90deg)',
      };
    case 'right':
      return {
        ...base,
        left: -(size - 1),
        top: arrowTop,
        transform: 'rotate(-90deg)',
      };
  }
}

export const PopoverArrow = forwardRef<HTMLSpanElement, ArrowElementProps>(
  ({ placement, size, arrowTop, arrowLeft, className, style, ...rest }, ref) => {
    const arrowStyle = getArrowStyle(placement, size, arrowTop, arrowLeft);

    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={[styles.arrow, className].filter(Boolean).join(' ')}
        style={{ ...arrowStyle, ...style }}
        {...rest}
      >
        {/* SVG triangle pointing upward; CSS rotation handles all sides */}
        <svg
          width={size * 2}
          height={size}
          viewBox={`0 0 ${size * 2} ${size}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={`M0 ${size} L${size} 0 L${size * 2} ${size}`} fill="var(--popover-bg)" />
          <path
            d={`M0 ${size} L${size} 0 L${size * 2} ${size}`}
            stroke="var(--popover-border)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </span>
    );
  },
);

PopoverArrow.displayName = 'PopoverArrow';
