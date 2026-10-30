import { ALERGENOS, type Menu } from "@/lib/rsvp";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type AdminPersona = {
  nombre: string;
  orden: number;
  es_responsable: boolean;
  es_menor: boolean;
  edad: number | null;
  menu: Menu;
  alergenos: string[];
  otras_alergias: string | null;
};

export type AdminRsvp = {
  id: string;
  created_at: string;
  nombre: string;
  telefono: string;
  asiste: boolean;
  viene_de_blanco: boolean;
  desinvitado: boolean;
  cancion: string | null;
  mensaje: string | null;
  idioma: string;
  personas: AdminPersona[];
};

export const adminConfigurado = Boolean(URL && KEY);

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: KEY! },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("login");
  return (await res.json()).access_token as string;
}

async function rpc<T>(token: string, fn: string, body: object = {}): Promise<T> {
  const res = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: KEY!, Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("expired");
  if (res.status === 403 || res.status === 400) throw new Error("forbidden");
  if (!res.ok) throw new Error(`http-${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const listar = (token: string) => rpc<AdminRsvp[]>(token, "admin_listar");
export const borrar = (token: string, id: string) => rpc<void>(token, "admin_borrar", { rsvp: id });

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** CSV con una fila por persona (para organizar menús y alergias). */
export function aCsv(rows: AdminRsvp[]): string {
  const head = [
    "fecha", "responsable", "telefono", "asiste", "de_blanco", "cancion", "mensaje",
    "persona", "tipo", "edad", "menu", ...ALERGENOS, "otras_alergias",
  ];
  const lines = [head.map(esc).join(",")];
  for (const r of rows) {
    const base = [r.created_at, r.nombre, r.telefono, r.asiste ? "si" : "no", r.viene_de_blanco ? "si" : "no", r.cancion, r.mensaje];
    const people = r.personas.length ? r.personas : [null];
    for (const p of people) {
      lines.push(
        [
          ...base,
          p?.nombre ?? r.nombre,
          p ? (p.es_menor ? "niño" : "adulto") : "",
          p?.edad ?? "",
          p?.menu ?? "",
          ...ALERGENOS.map((a) => (p?.alergenos.includes(a) ? "x" : "")),
          p?.otras_alergias ?? "",
        ].map(esc).join(","),
      );
    }
  }
  return "\ufeff" + lines.join("\r\n");
}
