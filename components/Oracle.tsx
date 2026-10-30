"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";

// Iconos decorativos de la ruleta; la predicción sale de un mazo aleatorio.
const ICONS = ["🔮", "🧀", "🐱", "🥙", "🥂", "💃", "🪩", "🧅", "🍤", "📸", "🌙", "🕺", "⭐", "🪑"];
const SEG = 360 / ICONS.length;
const SPIN_MS = 4400;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Eye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="none" stroke="#C7AD85" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M3 20C12 7 22 3 32 3s20 4 29 17c-9 13-19 17-29 17S12 33 3 20Z" />
      <circle cx="32" cy="20" r="9" />
      <circle cx="32" cy="20" r="3.5" fill="#C7AD85" />
    </svg>
  );
}

const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(150 + r * Math.sin(a)).toFixed(2)} ${(150 - r * Math.cos(a)).toFixed(2)}`;
};

function Wheel({ rotation, spinning }: { rotation: number; spinning: boolean }) {
  return (
    <div className="relative mx-auto h-72 w-72 max-w-full">
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_0_18px_rgba(199,173,133,0.35)]" aria-hidden>
        <g
          style={{
            transformOrigin: "150px 150px",
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.7, 0.1, 1)` : "none",
          }}
        >
          <circle cx="150" cy="150" r="147" fill="#0a0b24" stroke="#C7AD85" strokeWidth="4" />
          {ICONS.map((icon, i) => (
            <g key={i}>
              <path
                d={`M150 150 L${pt((i - 0.5) * SEG, 142)} A142 142 0 0 1 ${pt((i + 0.5) * SEG, 142)} Z`}
                fill={i % 2 ? "#2a2270" : "#1c1750"}
                stroke="#C7AD85"
                strokeOpacity="0.5"
                strokeWidth="1"
              />
              <text
                x="150"
                y={150 - 108}
                fontSize="22"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${i * SEG} 150 150)`}
              >
                {icon}
              </text>
            </g>
          ))}
        </g>
        <circle cx="150" cy="150" r="20" fill="#0d0f2b" stroke="#C7AD85" strokeWidth="3" />
        <circle cx="150" cy="150" r="6" fill="#C7AD85" />
        <path d="M150 22 L138 -2 L162 -2 Z" fill="#C7AD85" stroke="#0a0b24" strokeWidth="2" />
      </svg>
    </div>
  );
}

export default function Oracle() {
  const { t } = useLang();
  const o = t.oracle;
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [n, setN] = useState(0);
  const last = useRef(-1);
  const bag = useRef<number[]>([]);
  const song = useRef<HTMLAudioElement>(null);
  const fade = useRef<ReturnType<typeof setInterval> | null>(null);
  const rot = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stars = useMemo(
    () =>
      open
        ? Array.from({ length: 90 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            s: 1 + Math.random() * 2.5,
            d: Math.random() * 4,
            t: 2 + Math.random() * 3,
            appear: 0.8 + Math.random() * 2.2,
          }))
        : [],
    [open],
  );

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const fadeTo = (target: number, ms: number, done?: () => void) => {
    const a = song.current;
    if (!a) return;
    if (fade.current) clearInterval(fade.current);
    const from = a.volume;
    const t0 = performance.now();
    fade.current = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = from + (target - from) * k;
      if (k >= 1) {
        if (fade.current) clearInterval(fade.current);
        done?.();
      }
    }, 50);
  };

  const start = () => {
    document.querySelectorAll("audio").forEach((el) => el !== song.current && el.pause());
    const a = song.current;
    if (a) {
      a.volume = 0;
      a.currentTime = 0;
      void a.play().then(() => fadeTo(0.8, 3000)).catch(() => {});
    }
    setOpen(true);
  };

  const close = () => {
    if (closing) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setClosing(true);
    fadeTo(0, 900, () => song.current?.pause());
    later(() => {
      setOpen(false);
      setClosing(false);
      setText(null);
      setSpinning(false);
      last.current = -1;
    }, 1000);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closing]);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    if (fade.current) clearInterval(fade.current);
  }, []);

  const spin = () => {
    if (spinning) return;
    const count = o.predictions.length;
    if (bag.current.length === 0) {
      bag.current = shuffled(count);
      if (bag.current[bag.current.length - 1] === last.current) bag.current.reverse();
    }
    const i = bag.current.pop()!;
    last.current = i;
    const wedge = Math.floor(Math.random() * ICONS.length);
    const jitter = (Math.random() - 0.5) * SEG * 0.6;
    const delta = (((-(wedge * SEG) - jitter - rot.current) % 360) + 360) % 360;
    rot.current += 360 * 5 + delta;
    setText(null);
    setSpinning(true);
    setRotation(rot.current);
    later(() => {
      setText(o.predictions[i]);
      setN((x) => x + 1);
      setSpinning(false);
    }, SPIN_MS + 100);
  };

  return (
    <>
      <audio ref={song} src={`${BASE}/santuario.mp3`} loop preload="none" />
      <button
        type="button"
        onClick={start}
        aria-label={o.open}
        title={o.open}
        className="eye-glow fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-champan bg-[#0d0f2b] shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burdeos"
        style={{ animation: "eye-glow 2.6s ease-in-out infinite" }}
      >
        <Eye className="h-7 w-10" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={o.title}
          className="fixed inset-0 z-[85] overflow-y-auto text-center text-[#f3eddc]"
          style={{
            background: "radial-gradient(ellipse at 50% 20%, #1c1750 0%, #0a0b24 55%, #03030f 100%)",
            animation: closing ? "night-out 1s ease-in forwards" : "night-in 3s ease-in forwards",
          }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {stars.map((s, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: `${s.x}%`, top: `${s.y}%`, animation: `star-in 1.6s ease-out ${s.appear}s both` }}
              >
                <span
                  className="twinkle block rounded-full bg-[#fff4d1]"
                  style={{
                    width: s.s,
                    height: s.s,
                    boxShadow: `0 0 ${s.s * 3}px #fff4d1`,
                    animation: `twinkle ${s.t}s ease-in-out ${s.d}s infinite`,
                  }}
                />
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={close}
            aria-label={o.close}
            className="fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-champan/70 text-2xl text-champan"
          >
            ×
          </button>

          <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-14" style={{ animation: "oracle-in 1.6s ease-out 1.8s both" }}>
            <Eye className="h-10 w-16" />
            <h2 className="mt-3 text-balance font-display text-5xl text-champan">{o.title}</h2>
            <p className="mt-2 font-display text-2xl text-champan/80">{o.sub}</p>
            <p className="mt-7 max-w-xs text-base text-[#f3eddc]/80">{o.intro}</p>

            <div className="mt-6">
              <Wheel rotation={rotation} spinning={spinning} />
            </div>

            <div className="mt-5 flex min-h-[8rem] w-full max-w-sm items-center justify-center" aria-live="polite">
              {spinning && <p className="font-display text-2xl text-champan/90">{o.thinking}</p>}
              {!spinning && text && (
                <p
                  key={n}
                  className="rounded-2xl border border-champan/50 bg-white/5 px-5 py-4 font-display text-2xl leading-snug text-[#fff4d1]"
                  style={{ animation: "oracle-in .7s ease-out both" }}
                >
                  {text}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={spin}
              disabled={spinning}
              className="mt-4 rounded-full border-2 border-champan bg-champan/15 px-7 py-2.5 font-display text-2xl text-champan transition hover:bg-champan/30 disabled:opacity-50"
            >
              {text ? o.again : o.button}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
