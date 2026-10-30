"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminConfigurado, aCsv, borrar, listar, login, type AdminRsvp } from "@/lib/admin";
import { ALERGENOS } from "@/lib/rsvp";

const TOKEN_KEY = "boda-admin-token";
const input =
  "w-full rounded-xl border-2 border-champan/60 bg-white/70 px-4 py-2.5 text-lg text-bosque focus:border-burdeos focus:outline-none";
const btn =
  "rounded-full border-2 border-oliva px-4 py-1.5 font-display text-xl text-oliva hover:bg-oliva hover:text-marfil disabled:opacity-50";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [rows, setRows] = useState<AdminRsvp[]>([]);
  const [filter, setFilter] = useState<"todos" | "si" | "no">("todos");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const salir = useCallback((m = "") => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setRows([]);
    setMsg(m);
  }, []);

  const cargar = useCallback(
    async (tk: string) => {
      setBusy(true);
      setMsg("");
      try {
        setRows(await listar(tk));
      } catch (e) {
        const m = (e as Error).message;
        if (m === "expired") salir("La sesión ha caducado. Entra de nuevo.");
        else if (m === "forbidden") salir("Este usuario no tiene permiso de administrador.");
        else setMsg("No se pudieron cargar las respuestas.");
      } finally {
        setBusy(false);
      }
    },
    [salir],
  );

  useEffect(() => {
    const tk = sessionStorage.getItem(TOKEN_KEY);
    if (tk) {
      setToken(tk);
      cargar(tk);
    }
    setReady(true);
  }, [cargar]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const tk = await login(email.trim(), pass);
      sessionStorage.setItem(TOKEN_KEY, tk);
      setToken(tk);
      setPass("");
      await cargar(tk);
    } catch {
      setMsg("Email o contraseña incorrectos.");
      setBusy(false);
    }
  };

  const eliminar = async (r: AdminRsvp) => {
    if (!token || !confirm(`¿Borrar la respuesta de ${r.nombre}? No se puede deshacer.`)) return;
    try {
      await borrar(token, r.id);
      setRows((x) => x.filter((y) => y.id !== r.id));
    } catch {
      setMsg("No se pudo borrar.");
    }
  };

  const stats = useMemo(() => {
    const yes = rows.filter((r) => r.asiste);
    const people = yes.flatMap((r) => r.personas);
    const menus: Record<string, number> = {};
    const alerg: Record<string, number> = {};
    for (const p of people) {
      menus[p.menu] = (menus[p.menu] ?? 0) + 1;
      for (const a of p.alergenos) alerg[a] = (alerg[a] ?? 0) + 1;
    }
    return {
      total: rows.length,
      yes: yes.length,
      no: rows.length - yes.length,
      adultos: people.filter((p) => !p.es_menor).length,
      ninos: people.filter((p) => p.es_menor).length,
      menus,
      alerg,
      otras: people.filter((p) => p.otras_alergias).length,
      blanco: yes.filter((r) => r.viene_de_blanco).length,
    };
  }, [rows]);

  const visibles = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === "todos" || (filter === "si") === r.asiste) &&
        (!s || [r.nombre, r.telefono, r.cancion ?? "", r.mensaje ?? "", ...r.personas.map((p) => p.nombre)].join(" ").toLowerCase().includes(s)),
    );
  }, [rows, filter, q]);

  const descargar = () => {
    const url = URL.createObjectURL(new Blob([aCsv(visibles)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "respuestas-boda.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!ready) return null;

  if (!adminConfigurado)
    return <Shell><p className="text-center text-lg text-burdeos">Faltan las variables de Supabase en esta compilación.</p></Shell>;

  if (!token)
    return (
      <Shell>
        <form onSubmit={entrar} className="mx-auto max-w-sm space-y-4">
          <input className={input} type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" autoComplete="current-password" placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)} required />
          {msg && <p role="alert" className="text-center text-burdeos">{msg}</p>}
          <button className={`${btn} w-full`} disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
        </form>
      </Shell>
    );

  const Stat = ({ n, l }: { n: number; l: string }) => (
    <div className="rounded-2xl border-2 border-champan/50 bg-white/50 px-3 py-3 text-center">
      <p className="font-display text-4xl leading-none text-burdeos">{n}</p>
      <p className="mt-1 text-sm text-bosque/80">{l}</p>
    </div>
  );

  return (
    <Shell wide>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <button className={btn} onClick={() => token && cargar(token)} disabled={busy}>{busy ? "Cargando…" : "Actualizar"}</button>
        <button className={btn} onClick={descargar} disabled={!visibles.length}>Descargar CSV</button>
        <button className={btn} onClick={() => salir()}>Salir</button>
      </div>
      {msg && <p role="alert" className="mb-4 text-center text-burdeos">{msg}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat n={stats.total} l="respuestas" />
        <Stat n={stats.yes} l="confirman" />
        <Stat n={stats.no} l="no vienen" />
        <Stat n={stats.adultos + stats.ninos} l="personas en total" />
        <Stat n={stats.adultos} l="adultos" />
        <Stat n={stats.ninos} l="niños" />
        <Stat n={stats.menus.infantil ?? 0} l="menús infantiles" />
        <Stat n={stats.blanco} l="de blanco 😅" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-champan/50 bg-white/50 p-4">
          <h2 className="font-display text-2xl text-oliva">Menús</h2>
          <p className="text-lg">
            {(["normal", "vegetariano", "vegano", "infantil"] as const).map((m) => `${m}: ${stats.menus[m] ?? 0}`).join(" · ")}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-champan/50 bg-white/50 p-4">
          <h2 className="font-display text-2xl text-oliva">Alergias</h2>
          <p className="text-lg">
            {ALERGENOS.filter((a) => stats.alerg[a]).map((a) => `${a}: ${stats.alerg[a]}`).join(" · ") || "Ninguna"}
            {stats.otras > 0 && ` · otras: ${stats.otras}`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input className={`${input} sm:max-w-xs`} placeholder="Buscar nombre, teléfono, canción…" value={q} onChange={(e) => setQ(e.target.value)} />
        {(["todos", "si", "no"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`${btn} ${filter === f ? "bg-oliva !text-marfil" : ""}`}>
            {f === "todos" ? "Todos" : f === "si" ? "Confirman" : "No vienen"}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {visibles.length === 0 && <li className="py-8 text-center text-bosque/70">No hay respuestas.</li>}
        {visibles.map((r) => (
          <li key={r.id} className="rounded-2xl border-2 border-champan/50 bg-white/50">
            <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
              <span>
                <span className="font-display text-2xl text-bosque">{r.nombre}</span>
                <span className="ml-2 text-sm text-bosque/70">{fmt(r.created_at)}</span>
              </span>
              <span className={`shrink-0 rounded-full px-3 py-0.5 text-sm ${r.asiste ? "bg-oliva/20 text-bosque" : "bg-burdeos/15 text-burdeos"}`}>
                {r.asiste ? `viene · ${r.personas.length}` : "no viene"}
              </span>
            </button>
            {open === r.id && (
              <div className="space-y-2 border-t-2 border-champan/40 px-4 py-3 text-base">
                <p>📞 <a className="underline" href={`tel:${r.telefono}`}>{r.telefono}</a> · idioma: {r.idioma}{r.viene_de_blanco && " · viene de blanco 😅"}</p>
                {r.cancion && <p>🎵 {/^https?:\/\//.test(r.cancion) ? <a className="break-all underline" href={r.cancion} target="_blank" rel="noopener noreferrer">{r.cancion}</a> : r.cancion}</p>}
                {r.mensaje && <p className="whitespace-pre-wrap">💬 {r.mensaje}</p>}
                {r.personas.length > 0 && (
                  <ul className="space-y-1">
                    {r.personas.map((p) => (
                      <li key={p.orden} className="rounded-xl bg-marfil/70 px-3 py-2">
                        <b>{p.nombre}</b> · {p.es_menor ? `niño${p.edad != null ? ` (${p.edad})` : ""}` : "adulto"} · menú {p.menu}
                        {(p.alergenos.length > 0 || p.otras_alergias) && (
                          <span className="block text-burdeos">
                            ⚠ {[...p.alergenos, p.otras_alergias].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <button className="text-sm text-burdeos underline" onClick={() => eliminar(r)}>Borrar respuesta</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className="min-h-dvh bg-marfil px-4 py-12 text-bosque">
      <div className={`mx-auto ${wide ? "max-w-3xl" : "max-w-md"}`}>
        <h1 className="mb-8 text-center font-display text-5xl text-burdeos">Respuestas</h1>
        {children}
      </div>
    </main>
  );
}
