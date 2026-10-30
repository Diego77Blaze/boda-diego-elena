"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#C7AD85", "#702D3C", "#777D56", "#354A3C", "#E8D9B8", "#B5566B"];

type Piece = { x: number; y: number; w: number; h: number; vx: number; vy: number; r: number; vr: number; c: string; round: boolean };

export default function PartyMode({ active }: { active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);

    const make = (burst: boolean): Piece => ({
      x: Math.random() * innerWidth,
      y: burst ? Math.random() * innerHeight * 0.5 - innerHeight * 0.5 : -20,
      w: 6 + Math.random() * 7,
      h: 9 + Math.random() * 9,
      vx: (Math.random() - 0.5) * 1.6,
      vy: 1.5 + Math.random() * 2.5,
      r: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      round: Math.random() < 0.25,
    });

    const pieces: Piece[] = Array.from({ length: 140 }, () => make(true));
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.x += p.vx + Math.sin(p.y / 40) * 0.6;
        p.y += p.vy;
        p.r += p.vr;
        if (p.y > innerHeight + 20) {
          Object.assign(p, make(false));
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
  }, [active]);

  return (
    <>
      <canvas ref={canvas} aria-hidden className={`pointer-events-none fixed inset-0 z-[60] h-full w-full ${active ? "" : "hidden"}`} />
      <div role="status" aria-live="polite" className="sr-only">{active ? "¡Vivan los novios!" : ""}</div>
      {active && (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-1/3 z-[61] px-6 text-center font-display text-4xl text-burdeos [text-shadow:0_2px_0_#F7F3EA,0_0_18px_#F7F3EA] animate-[party-pop_4s_ease-out_forwards] sm:text-6xl">
          ¡Vivan los novios!
        </div>
      )}
    </>
  );
}
