/**
 * Popover – Usage Examples
 * ─────────────────────────────────────────────────────────────────────────────
 * These snippets show the most common use-cases. Copy-paste as needed.
 */

import React, { useRef, useState } from 'react';
import { Popover } from './index';

// ─── 1. Basic tooltip-style popover ──────────────────────────────────────────

export function BasicExample() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={anchorRef} onClick={() => setOpen((v) => !v)}>
        Toggle popover
      </button>

      <Popover
        anchorEl={anchorRef}
        open={open}
        placement='right-end'
        onClose={() => setOpen(false)}
      >
        <div style={{ padding: '12px 16px' }}>Hello from Popover!</div>
      </Popover>
    </>
  );
}

// ─── 2. No arrow, fade transition ────────────────────────────────────────────

export function FadeNoArrowExample() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={anchorRef} onClick={() => setOpen((v) => !v)}>
        Open menu
      </button>

      <Popover
        anchorEl={anchorRef}
        open={open}
        placement="bottom-start"
        arrow={false}
        transition="fade"
        offset={{ mainAxis: 4 }}
        onClose={() => setOpen(false)}
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: '4px 0', minWidth: 160 }}>
          <li style={{ padding: '8px 16px', cursor: 'pointer' }}>Item one</li>
          <li style={{ padding: '8px 16px', cursor: 'pointer' }}>Item two</li>
          <li style={{ padding: '8px 16px', cursor: 'pointer' }}>Item three</li>
        </ul>
      </Popover>
    </>
  );
}

// ─── 3. Custom arrow size & theming via CSS variables ────────────────────────

export function ThemedExample() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={anchorRef} onClick={() => setOpen((v) => !v)}>
        Dark popover
      </button>

      <Popover
        anchorEl={anchorRef}
        open={open}
        placement="top"
        arrow={{ size: 10, padding: 8 }}
        transition="shift"
        onClose={() => setOpen(false)}
        style={
          {
            '--popover-bg': '#1a1a2e',
            '--popover-border': 'rgba(255,255,255,0.1)',
            '--popover-shadow': '0 8px 32px rgba(0,0,0,0.4)',
            color: '#e2e8f0',
          } as React.CSSProperties
        }
      >
        <div style={{ padding: '10px 14px', fontSize: 14 }}>
          Themed dark popover ✦
        </div>
      </Popover>
    </>
  );
}

// ─── 4. keepMounted + manual anchor element ──────────────────────────────────

export function KeepMountedExample() {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <button
        ref={(el) => setAnchor(el)}
        onClick={() => setOpen((v) => !v)}
      >
        keepMounted popover
      </button>

      <Popover
        anchorEl={anchor}
        open={open}
        keepMounted
        transition="none"
        onClose={() => setOpen(false)}
      >
        <div style={{ padding: 16 }}>Always in DOM, instant transition</div>
      </Popover>
    </>
  );
}
