"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";

// speed: avance del brazo por segundo · push: lo que lo frena cada pulsación
const VARIANTS = [
  { speed: 0.3, push: 0.14 },
  { speed: 0.18, push: 0.1 },
  { speed: 0.55, push: 0.1 },
  { speed: 1.1, push: 0.07 },
];
const ROUNDS = VARIANTS.length;
const ARM_START = 240;
const ARM_LEN = 105;

export default function WhiteMachine({ onInsist }: { onInsist: () => void }) {
  const { t } = useLang();
  const [on, setOn] = useState(false);
  const [phase, setPhase] = useState<"idle" | "fight" | "retract">("idle");
  const [p, setP] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hit, setHit] = useState(false);
  const [lost, setLost] = useState(false);
  const [popup, setPopup] = useState(false);
  const pRef = useRef(0);
  const hitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const v = VARIANTS[Math.min(attempts, ROUNDS - 1)];

  useEffect(() => {
    if (phase === "idle") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (phase === "fight") {
        pRef.current = Math.min(1, pRef.current + v.speed * dt);
        if (pRef.current >= 1) {
          setP(1);
          setOn(false);
          setLost(true);
          const n = attempts + 1;
          setAttempts(n);
          setPhase("retract");
          if (n >= ROUNDS) {
            onInsist();
            setPopup(true);
          }
          return;
        }
      } else {
        pRef.current = Math.max(0, pRef.current - 2.2 * dt);
        if (pRef.current <= 0) {
          setP(0);
          setPhase("idle");
          return;
        }
      }
      setP(pRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, v.speed, attempts, onInsist]);

  useEffect(() => () => { if (hitTimer.current) clearTimeout(hitTimer.current); }, []);

  const closePopup = useCallback(() => {
    setPopup(false);
    setAttempts(0);
    setLost(false);
  }, []);

  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePopup();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popup, closePopup]);

  const flip = () => {
    if (phase === "idle") {
      setOn(true);
      setLost(false);
      setPhase("fight");
    } else if (phase === "fight") {
      pRef.current = Math.max(0, pRef.current - v.push);
      setP(pRef.current);
      setHit(true);
      if (hitTimer.current) clearTimeout(hitTimer.current);
      hitTimer.current = setTimeout(() => setHit(false), 140);
    }
  };

  const handX = ARM_START - p * ARM_LEN;
  const angry = phase === "fight" && p > 0.02;
  const line = phase === "fight"
    ? t.rsvp.bot.fight[Math.min(attempts, ROUNDS - 1)]
    : lost
      ? t.rsvp.bot.win[Math.min(attempts - 1, ROUNDS - 1)]
      : t.rsvp.bot.hint;

  return (
    <>
      <div className="rounded-2xl border-2 border-champan/60 bg-white/50 p-3">
        <svg viewBox="0 0 340 130" className="w-full select-none" role="group" aria-label={t.rsvp.white}>
          <g
            role="switch"
            aria-checked={on}
            aria-label={t.rsvp.white}
            tabIndex={0}
            style={{ cursor: "pointer", outline: "none" }}
            onClick={flip}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                flip();
              }
            }}
          >
            <rect x="10" y="35" width="110" height="60" rx="30" fill={on ? "#777D56" : "#D9D2C0"} style={{ transition: "fill .25s" }} />
            <g style={{ transform: `translateX(${on ? 50 : 0}px)`, transition: "transform .25s" }}>
              <circle cx="40" cy="65" r="22" fill="#F7F3EA" stroke="#C7AD85" strokeWidth="3" />
            </g>
          </g>

          <g style={{ transform: hit ? "translateX(3px)" : "none", transition: "transform .1s" }}>
            <line x1="285" y1="20" x2="285" y2="8" stroke="#354A3C" strokeWidth="4" strokeLinecap="round" />
            <circle cx="285" cy="7" r="5" fill="#702D3C" />
            <rect x="240" y="20" width="90" height="95" rx="14" fill="#354A3C" />
            <rect x="232" y="55" width="14" height="30" rx="5" fill="#1d2a22" />
            {[262, 308].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy="52" r="10" fill="#F7F3EA" />
                <circle cx={hit ? cx : cx - 3} cy="52" r="4.5" fill={angry ? "#702D3C" : "#354A3C"} />
              </g>
            ))}
            {angry && (
              <>
                <line x1="250" y1="36" x2="272" y2="42" stroke="#F7F3EA" strokeWidth="4" strokeLinecap="round" />
                <line x1="320" y1="36" x2="298" y2="42" stroke="#F7F3EA" strokeWidth="4" strokeLinecap="round" />
              </>
            )}
            <path
              d={hit ? "M268 96 Q285 88 302 96" : angry ? "M268 94 L302 94" : "M268 92 Q285 100 302 92"}
              stroke="#F7F3EA"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {p > 0.01 && (
            <g>
              <line x1="240" y1="70" x2={handX} y2="70" stroke="#C7AD85" strokeWidth="10" strokeLinecap="round" />
              <circle cx={handX} cy="70" r="11" fill="#C7AD85" stroke="#354A3C" strokeWidth="2" />
              <rect x={handX - 20} y="66" width="16" height="8" rx="4" fill="#C7AD85" stroke="#354A3C" strokeWidth="2" />
            </g>
          )}
        </svg>
        <p className="px-1 pb-1 text-center font-display text-xl text-burdeos" aria-live="polite">{line}</p>
        {phase === "fight" && <p className="px-1 text-center text-sm text-bosque/70">{t.rsvp.bot.mash}</p>}
      </div>

      {popup && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-5" role="alertdialog" aria-modal="true" aria-labelledby="uninvited-title">
          <div className="w-full max-w-sm rounded-3xl border-4 border-champan bg-burdeos px-6 py-8 text-center text-marfil shadow-2xl">
            <p className="text-7xl" aria-hidden>😠</p>
            <h3 id="uninvited-title" className="mt-3 font-display text-4xl leading-tight break-words">{t.rsvp.bot.popupTitle}</h3>
            <p className="mt-4 text-lg">{t.rsvp.bot.popupText}</p>
            <button
              type="button"
              autoFocus
              onClick={closePopup}
              className="mt-6 rounded-full border-2 border-champan bg-marfil px-6 py-2 font-display text-2xl text-burdeos"
            >
              😠 {t.rsvp.bot.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
