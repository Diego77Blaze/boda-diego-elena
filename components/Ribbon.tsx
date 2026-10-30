"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  className?: string;
  width?: number;
  /** Margen lateral e inferior del marco, en px. */
  margin?: number;
  /** Altura de la línea superior; deja sitio para el lazo si `bow`. */
  top?: number;
  bow?: boolean;
  amp?: number;
};

const R = 16;
const STEP = 5;

/** Punto y normal exterior sobre un rectángulo redondeado, recorrido en horario desde el centro del borde superior. */
function makeShape(x0: number, y0: number, w: number, h: number) {
  const sw = w - 2 * R, sh = h - 2 * R, arc = (Math.PI / 2) * R;
  const segs = [
    { len: sw / 2, f: (t: number) => [x0 + w / 2 + t, y0, 0, -1] },
    { len: arc, f: (t: number) => { const a = -Math.PI / 2 + t / R; return [x0 + w - R + R * Math.cos(a), y0 + R + R * Math.sin(a), Math.cos(a), Math.sin(a)]; } },
    { len: sh, f: (t: number) => [x0 + w, y0 + R + t, 1, 0] },
    { len: arc, f: (t: number) => { const a = t / R; return [x0 + w - R + R * Math.cos(a), y0 + h - R + R * Math.sin(a), Math.cos(a), Math.sin(a)]; } },
    { len: sw, f: (t: number) => [x0 + w - R - t, y0 + h, 0, 1] },
    { len: arc, f: (t: number) => { const a = Math.PI / 2 + t / R; return [x0 + R + R * Math.cos(a), y0 + h - R + R * Math.sin(a), Math.cos(a), Math.sin(a)]; } },
    { len: sh, f: (t: number) => [x0, y0 + h - R - t, -1, 0] },
    { len: arc, f: (t: number) => { const a = Math.PI + t / R; return [x0 + R + R * Math.cos(a), y0 + R + R * Math.sin(a), Math.cos(a), Math.sin(a)]; } },
    { len: sw / 2, f: (t: number) => [x0 + R + t, y0, 0, -1] },
  ];
  const total = segs.reduce((n, s) => n + s.len, 0);
  return { segs, total };
}

function wavyPath(w: number, h: number, margin: number, top: number, amp: number) {
  const { segs, total } = makeShape(margin, top, w - 2 * margin, h - top - margin);
  const pts: string[] = [];
  const n = Math.max(2, Math.round(total / STEP));
  for (let i = 0; i <= n; i++) {
    let s = (i / n) * total;
    let k = 0;
    while (k < segs.length - 1 && s > segs[k].len) { s -= segs[k].len; k++; }
    const [px, py, nx, ny] = segs[k].f(s);
    const u = (i / n) * total;
    // Ondas que valen 0 en el centro superior, para que el nudo del lazo encaje en la cinta.
    const off = amp * (Math.sin(u / 34) * 0.85 + Math.sin(u / 21 + 1.1) * 0.15) * Math.min(1, u / 40) * Math.min(1, (total - u) / 40);
    pts.push(`${(px + nx * off).toFixed(1)},${(py + ny * off).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

/** Marco de cinta ondulante dibujada a mano, con lazo opcional centrado en el borde superior. */
export function RibbonFrame({ className, width = 4, margin = 14, top = 46, bow = false, amp = 5.5 }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const s = 0.85;
  return (
    <svg ref={ref} className={className} aria-hidden>
      {size && (
        <>
          <path
            d={wavyPath(size.w, size.h, margin, top, amp)}
            fill="none"
            stroke="#702d3c"
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {bow && (
            <g
              transform={`translate(${size.w / 2 - 60 * s} ${top - 38 * s}) scale(${s})`}
              fill="none"
              stroke="#702d3c"
              strokeWidth={5.2 / s}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M60,38 C42,9 9,7 14,30 C18,50 46,46 60,38 Z" />
              <path d="M60,38 C78,9 111,7 106,30 C102,50 74,46 60,38 Z" />
              <path d="M56,44 C50,56 45,63 38,70" />
              <path d="M64,44 C70,56 77,61 84,68" />
              <path d="M55,37 C58,32 63,33 65,38 C63,43 58,43 55,37 Z" fill="#702d3c" />
            </g>
          )}
        </>
      )}
    </svg>
  );
}
