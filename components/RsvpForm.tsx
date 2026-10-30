"use client";

import { useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { ALERGENOS, cancionValida, enviarRsvp, rsvpConfigurado, type Alergeno, type Menu } from "@/lib/rsvp";

type Guest = {
  id: number;
  nombre: string;
  es_menor: boolean;
  edad: string;
  menu: Menu;
  alergenos: Alergeno[];
  otras: string;
};

const MAX_PEOPLE = 12;
let nextId = 1;
const newGuest = (es_menor: boolean): Guest => ({
  id: nextId++,
  nombre: "",
  es_menor,
  edad: "",
  menu: es_menor ? "infantil" : "normal",
  alergenos: [],
  otras: "",
});

const input =
  "w-full rounded-xl border-2 border-champan/60 bg-white/70 px-4 py-2.5 text-lg text-bosque placeholder:text-bosque/40 focus:border-burdeos focus:outline-none";
const label = "mb-1.5 block font-display text-xl text-oliva";

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`cursor-pointer rounded-full border-2 px-5 py-2 font-display text-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burdeos ${
        on ? "border-burdeos bg-burdeos text-marfil" : "border-champan/60 text-bosque hover:border-burdeos/60"
      }`}
    >
      {children}
    </button>
  );
}

function GuestCard({
  g,
  index,
  isYou,
  onChange,
  onRemove,
}: {
  g: Guest;
  index: number;
  isYou: boolean;
  onChange: (patch: Partial<Guest>) => void;
  onRemove?: () => void;
}) {
  const { t } = useLang();
  const menus: Menu[] = g.es_menor ? ["infantil", "normal", "vegetariano", "vegano"] : ["normal", "vegetariano", "vegano"];
  const toggle = (a: Alergeno) =>
    onChange({ alergenos: g.alergenos.includes(a) ? g.alergenos.filter((x) => x !== a) : [...g.alergenos, a] });

  return (
    <fieldset className="rounded-2xl border-2 border-champan/50 bg-white/40 p-4 text-left sm:p-5">
      <legend className="rounded-full bg-burdeos px-3 py-0.5 font-display text-lg text-marfil">
        {isYou ? t.rsvp.you : `${g.es_menor ? t.rsvp.child : t.rsvp.adult} ${index}`}
      </legend>

      {!isYou && (
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
          <div>
            <label className={label} htmlFor={`n-${g.id}`}>{t.rsvp.guestName}</label>
            <input id={`n-${g.id}`} className={input} value={g.nombre} maxLength={100} onChange={(e) => onChange({ nombre: e.target.value })} />
          </div>
          {g.es_menor && (
            <div>
              <label className={label} htmlFor={`e-${g.id}`}>{t.rsvp.age}</label>
              <input id={`e-${g.id}`} className={input} inputMode="numeric" maxLength={2} value={g.edad} onChange={(e) => onChange({ edad: e.target.value.replace(/\D/g, "") })} />
            </div>
          )}
        </div>
      )}

      <div className="mt-3">
        <span className={label}>{t.rsvp.menu}</span>
        <div className="flex flex-wrap gap-2">
          {menus.map((m) => (
            <Choice key={m} on={g.menu === m} onClick={() => onChange({ menu: m })}>
              {t.rsvp.menus[m]}
            </Choice>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className={label}>{t.rsvp.allergens}</span>
        <div className="flex flex-wrap gap-2">
          {ALERGENOS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={g.alergenos.includes(a)}
              onClick={() => toggle(a)}
              className={`cursor-pointer rounded-full border px-3.5 py-1 text-base transition focus-visible:outline-2 focus-visible:outline-burdeos ${
                g.alergenos.includes(a) ? "border-burdeos bg-burdeos/10 font-medium text-burdeos" : "border-champan/60 text-bosque/80 hover:border-burdeos/50"
              }`}
            >
              {t.allergens[a]}
            </button>
          ))}
        </div>
        <input
          aria-label={t.rsvp.otherAllergies}
          placeholder={t.rsvp.otherAllergies}
          className={`${input} mt-3`}
          maxLength={300}
          value={g.otras}
          onChange={(e) => onChange({ otras: e.target.value })}
        />
      </div>

      {onRemove && (
        <button type="button" onClick={onRemove} className="mt-4 cursor-pointer font-display text-lg text-burdeos underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-burdeos">
          {t.rsvp.remove}
        </button>
      )}
    </fieldset>
  );
}

export default function RsvpForm() {
  const { t, lang } = useLang();
  const top = useRef<HTMLDivElement>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [asiste, setAsiste] = useState<boolean | null>(null);
  const [yo, setYo] = useState<Guest>(() => newGuest(false));
  const [others, setOthers] = useState<Guest[]>([]);
  const [blanco, setBlanco] = useState<boolean | null>(null);
  const [cancion, setCancion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [sentAsiste, setSentAsiste] = useState(true);

  const all = [yo, ...others];
  const adults = all.filter((g) => !g.es_menor).length;
  const kids = all.length - adults;
  const kidMenus = all.filter((g) => g.menu === "infantil").length;

  const patchOther = (id: number, patch: Partial<Guest>) => setOthers((o) => o.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (trap) return;
    if (!nombre.trim() || telefono.trim().length < 6 || asiste === null || (asiste && others.some((g) => !g.nombre.trim()))) {
      return setError(t.rsvp.required);
    }
    if (cancion && !cancionValida(cancion)) return setError(t.rsvp.songInvalid);
    if (!consent) return setError(t.rsvp.consentRequired);
    if (!rsvpConfigurado) return setError(t.rsvp.notConfigured);

    setStatus("sending");
    try {
      await enviarRsvp({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        asiste,
        viene_de_blanco: asiste ? blanco === true : false,
        cancion: cancion.trim() || undefined,
        mensaje: mensaje.trim() || undefined,
        idioma: lang,
        consentimiento: true,
        personas: asiste
          ? [{ ...yo, nombre: nombre.trim() }, ...others].map((g, i) => ({
              nombre: g.nombre.trim() || nombre.trim(),
              es_responsable: i === 0,
              es_menor: g.es_menor,
              edad: g.es_menor && g.edad ? Number(g.edad) : null,
              menu: g.menu,
              alergenos: g.alergenos,
              otras_alergias: g.otras.trim() || undefined,
            }))
          : [],
      });
      setSentAsiste(asiste);
      setStatus("done");
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setStatus("idle");
      setError(t.rsvp.error);
    }
  }

  function reset() {
    setNombre("");
    setTelefono("");
    setAsiste(null);
    setYo(newGuest(false));
    setOthers([]);
    setBlanco(null);
    setCancion("");
    setMensaje("");
    setConsent(false);
    setStatus("idle");
  }

  return (
    <section id="rsvp" className="bg-marfil px-6 py-24 text-bosque">
      <div ref={top} className="mx-auto max-w-2xl scroll-mt-6 text-center">
        <h2 className="font-display text-5xl text-burdeos sm:text-6xl">{t.rsvp.title}</h2>

        {status === "done" ? (
          <div role="status" className="mt-10 rounded-2xl border-2 border-champan/60 bg-white/50 px-6 py-10">
            <p className="font-display text-4xl text-bosque">{sentAsiste ? t.rsvp.okYesTitle : t.rsvp.okNoTitle}</p>
            <p className="mt-3 text-lg">{sentAsiste ? t.rsvp.okYes : t.rsvp.okNo}</p>
            <button type="button" onClick={reset} className="mt-6 cursor-pointer font-display text-xl text-oliva underline decoration-champan decoration-2 underline-offset-4">
              {t.rsvp.again}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 space-y-7 text-left">
            <p className="text-center text-lg text-bosque/80 text-balance">{t.rsvp.intro}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="r-nombre">{t.rsvp.yourName}</label>
                <input id="r-nombre" className={input} value={nombre} maxLength={100} autoComplete="name" onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div>
                <label className={label} htmlFor="r-tel">{t.rsvp.phone}</label>
                <input id="r-tel" className={input} type="tel" value={telefono} maxLength={30} autoComplete="tel" onChange={(e) => setTelefono(e.target.value)} required />
              </div>
            </div>

            <div aria-hidden className="absolute -left-[9999px]">
              <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </div>

            <div>
              <span className={label}>{t.rsvp.attending}</span>
              <div className="flex flex-wrap gap-3">
                <Choice on={asiste === true} onClick={() => setAsiste(true)}>{t.rsvp.yes}</Choice>
                <Choice on={asiste === false} onClick={() => setAsiste(false)}>{t.rsvp.no}</Choice>
              </div>
            </div>

            {asiste && (
              <>
                <div>
                  <p className="font-display text-3xl text-burdeos">{t.rsvp.group}</p>
                  <p className="mt-1 text-bosque/75">{t.rsvp.groupHelp}</p>
                </div>

                <div className="space-y-4">
                  <GuestCard g={yo} index={1} isYou onChange={(p) => setYo((g) => ({ ...g, ...p }))} />
                  {others.map((g, i) => (
                    <GuestCard
                      key={g.id}
                      g={g}
                      index={others.slice(0, i + 1).filter((x) => x.es_menor === g.es_menor).length + (g.es_menor ? 0 : 1)}
                      isYou={false}
                      onChange={(p) => patchOther(g.id, p)}
                      onRemove={() => setOthers((o) => o.filter((x) => x.id !== g.id))}
                    />
                  ))}
                </div>

                {all.length < MAX_PEOPLE && (
                  <div className="flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => setOthers((o) => [...o, newGuest(false)])} className="cursor-pointer rounded-full border-2 border-oliva px-5 py-2 font-display text-xl text-oliva transition hover:bg-oliva hover:text-marfil focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burdeos">
                      {t.rsvp.addAdult}
                    </button>
                    <button type="button" onClick={() => setOthers((o) => [...o, newGuest(true)])} className="cursor-pointer rounded-full border-2 border-oliva px-5 py-2 font-display text-xl text-oliva transition hover:bg-oliva hover:text-marfil focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burdeos">
                      {t.rsvp.addChild}
                    </button>
                  </div>
                )}
                <p className="text-center font-display text-xl text-oliva" aria-live="polite">{t.rsvp.summary(adults, kids, kidMenus)}</p>

                <div>
                  <span className={label}>{t.rsvp.white}</span>
                  <div className="flex flex-wrap gap-3">
                    <Choice on={blanco === true} onClick={() => setBlanco(true)}>{t.rsvp.whiteYes}</Choice>
                    <Choice on={blanco === false} onClick={() => setBlanco(false)}>{t.rsvp.whiteNo}</Choice>
                  </div>
                  {blanco === true && (
                    <p role="status" className="mt-3 rounded-xl bg-burdeos/10 px-4 py-3 font-display text-xl text-burdeos">{t.rsvp.whiteJoke}</p>
                  )}
                </div>

                <div>
                  <label className={label} htmlFor="r-song">{t.rsvp.song}</label>
                  <input id="r-song" className={input} value={cancion} maxLength={200} placeholder={t.rsvp.songPlaceholder} onChange={(e) => setCancion(e.target.value)} />
                  <p className="mt-1 text-sm text-bosque/65">{t.rsvp.songHelp}</p>
                </div>
              </>
            )}

            {asiste !== null && (
              <div>
                <label className={label} htmlFor="r-msg">{t.rsvp.message}</label>
                <textarea id="r-msg" className={`${input} min-h-24`} value={mensaje} maxLength={1000} onChange={(e) => setMensaje(e.target.value)} />
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-3 text-base text-bosque/85">
              <input type="checkbox" className="mt-1 size-5 shrink-0 accent-burdeos" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{t.rsvp.consent}</span>
            </label>

            {error && <p role="alert" className="rounded-xl bg-burdeos/10 px-4 py-3 text-center text-lg text-burdeos">{error}</p>}

            <div className="text-center">
              <button
                type="submit"
                disabled={status === "sending"}
                className="cursor-pointer rounded-full bg-burdeos px-8 py-3 font-display text-2xl text-marfil shadow-sm transition hover:bg-burdeos/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burdeos disabled:opacity-60"
              >
                {status === "sending" ? t.rsvp.sending : t.rsvp.send}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
