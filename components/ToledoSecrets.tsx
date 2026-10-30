"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

const KEY = "boda-toledo-secretos";

// Zonas táctiles sobre la ilustración (en % del dibujo de 960×606).
const SITES = [
  { id: "catedral", style: { left: "34%", top: "1%", width: "21%", height: "31%" } },
  { id: "alcazar", style: { left: "66%", top: "2%", width: "27%", height: "24%" } },
  { id: "puente", style: { left: "6%", top: "41%", width: "46%", height: "32%" } },
] as const;
type Id = (typeof SITES)[number]["id"];

export default function ToledoSecrets({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const [found, setFound] = useState<Id[]>([]);
  const [open, setOpen] = useState<Id | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(saved)) setFound(saved.filter((x) => SITES.some((s) => s.id === x)));
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const tap = (id: Id) => {
    setOpen(id);
    if (!found.includes(id)) {
      const next = [...found, id];
      setFound(next);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
    }
  };

  const s = t.secrets;
  const site = open ? s.sites[open] : null;
  const all = found.length === SITES.length;

  return (
    <>
      <div className="relative [&_canvas]:block [&_img]:block">
        {children}
        {SITES.map(({ id, style }) => (
          <button
            key={id}
            type="button"
            aria-label={s.sites[id].name}
            onClick={() => tap(id)}
            style={{ ...style, WebkitTapHighlightColor: "transparent" }}
            className="absolute z-20 cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-burdeos"
          />
        ))}
      </div>
      <p className="mt-2 text-center text-sm text-bosque/60" aria-live="polite">
        {SITES.map((x) => (found.includes(x.id) ? s.sites[x.id].symbol : "✦")).join(" ")} · {s.hint(found.length)}
      </p>

      {open && site && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setOpen(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={site.name}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border-4 border-champan bg-marfil px-6 py-7 text-center shadow-2xl"
          >
            <p className="text-5xl" aria-hidden>{site.symbol}</p>
            <h3 className="mt-2 font-display text-4xl text-burdeos">{site.name}</h3>
            <p className="mt-1 text-sm uppercase tracking-wide text-oliva">{s.found} · {found.length}/{SITES.length}</p>
            <p className="mt-4 text-lg text-bosque">{site.text}</p>
            {all && <p className="mt-4 font-display text-2xl text-burdeos">{s.done}</p>}
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(null)}
              className="mt-5 rounded-full border-2 border-oliva px-6 py-1.5 font-display text-xl text-oliva"
            >
              {s.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
