"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

// 31 de julio de 2027, 18:30 en Toledo (CEST, UTC+2)
const TARGET = Date.parse("2027-07-31T18:30:00+02:00");

function diff(now: number) {
  const ms = Math.max(0, TARGET - now);
  return {
    done: now >= TARGET,
    d: Math.floor(ms / 86_400_000),
    h: Math.floor(ms / 3_600_000) % 24,
    m: Math.floor(ms / 60_000) % 60,
    s: Math.floor(ms / 1000) % 60,
  };
}

export default function Countdown() {
  const lt = useLang().t.countdown;
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    const tick = () => setT(diff(Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (t?.done) {
    return (
      <p className="font-display text-4xl text-burdeos text-center">{lt.today}</p>
    );
  }

  const cells = [
    [lt.days, t?.d],
    [lt.hours, t?.h],
    [lt.minutes, t?.m],
    [lt.seconds, t?.s],
  ] as const;

  return (
    <div role="timer" aria-label={lt.aria} className="flex items-start justify-center gap-1.5 sm:gap-6">
      {cells.map(([label, v], i) => (
        <div key={label} className="flex items-start gap-1.5 sm:gap-6">
          <div className="text-center min-w-[3.6rem] sm:min-w-20">
            <div className="font-display text-5xl sm:text-7xl leading-none [font-variant-numeric:lining-nums_tabular-nums] text-bosque">
              {v === undefined ? "––" : String(v).padStart(2, "0")}
            </div>
            <div className="mt-2 font-display text-lg sm:text-2xl text-oliva">{label}</div>
          </div>
          {i < cells.length - 1 && <span className="font-display text-3xl sm:text-5xl text-champan leading-none pt-1" aria-hidden>·</span>}
        </div>
      ))}
    </div>
  );
}
