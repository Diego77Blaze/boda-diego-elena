"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";

function Eye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="none" stroke="#C7AD85" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M3 20C12 7 22 3 32 3s20 4 29 17c-9 13-19 17-29 17S12 33 3 20Z" />
      <circle cx="32" cy="20" r="9" />
      <circle cx="32" cy="20" r="3.5" fill="#C7AD85" />
    </svg>
  );
}

export default function Oracle() {
  const { t } = useLang();
  const o = t.oracle;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [n, setN] = useState(0);
  const last = useRef(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stars = useMemo(
    () =>
      open
        ? Array.from({ length: 90 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            s: 1 + Math.random() * 2.5,
            d: Math.random() * 4,
            t: 2 + Math.random() * 3,
          }))
        : [],
    [open],
  );

  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
    setText(null);
    setThinking(false);
    last.current = -1;
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
  }, [open]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const consult = () => {
    if (thinking) return;
    setThinking(true);
    setText(null);
    timer.current = setTimeout(() => {
      let i = Math.floor(Math.random() * o.predictions.length);
      if (i === last.current) i = (i + 1) % o.predictions.length;
      last.current = i;
      setText(o.predictions[i]);
      setN((x) => x + 1);
      setThinking(false);
    }, 1100);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mx-auto mb-12 flex flex-col items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burdeos"
      >
        <span className="eye-glow flex h-16 w-16 items-center justify-center rounded-full border-2 border-champan bg-[#0d0f2b] transition group-hover:scale-105" style={{ animation: "eye-glow 2.6s ease-in-out infinite" }}>
          <Eye className="h-8 w-12" />
        </span>
        <span className="font-display text-xl text-oliva underline decoration-champan decoration-2 underline-offset-4">{o.open}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={o.title}
          className="fixed inset-0 z-[85] overflow-y-auto text-center text-[#f3eddc]"
          style={{ background: "radial-gradient(ellipse at 50% 20%, #1c1750 0%, #0a0b24 55%, #03030f 100%)" }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {stars.map((s, i) => (
              <span
                key={i}
                className="twinkle absolute rounded-full bg-[#fff4d1]"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: s.s,
                  height: s.s,
                  boxShadow: `0 0 ${s.s * 3}px #fff4d1`,
                  animation: `twinkle ${s.t}s ease-in-out ${s.d}s infinite`,
                }}
              />
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

          <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16">
            <Eye className="h-16 w-24" />
            <h2 className="mt-6 text-balance font-display text-5xl text-champan sm:text-6xl">{o.title}</h2>
            <p className="mt-3 max-w-xs text-lg text-[#f3eddc]/80">{o.intro}</p>

            <div className="mt-8 flex min-h-[9rem] w-full max-w-sm items-center justify-center" aria-live="polite">
              {thinking && <p className="font-display text-2xl text-champan/90">{o.thinking}</p>}
              {!thinking && text && (
                <p
                  key={n}
                  className="rounded-2xl border border-champan/50 bg-white/5 px-5 py-5 font-display text-2xl leading-snug text-[#fff4d1]"
                  style={{ animation: "oracle-in .7s ease-out both" }}
                >
                  {text}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={consult}
              disabled={thinking}
              className="mt-8 rounded-full border-2 border-champan bg-champan/15 px-7 py-2.5 font-display text-2xl text-champan transition hover:bg-champan/30 disabled:opacity-50"
            >
              {text ? o.again : o.button}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
