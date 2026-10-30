export const ALERGENOS = [
  "gluten",
  "crustaceos",
  "huevo",
  "pescado",
  "cacahuete",
  "soja",
  "lactosa",
  "frutos_secos",
  "apio",
  "mostaza",
  "sesamo",
  "sulfitos",
  "altramuces",
  "moluscos",
] as const;

export type Alergeno = (typeof ALERGENOS)[number];
export type Menu = "normal" | "vegetariano" | "vegano" | "infantil";

export type Persona = {
  nombre: string;
  es_responsable: boolean;
  es_menor: boolean;
  edad?: number | null;
  menu: Menu;
  alergenos: Alergeno[];
  otras_alergias?: string;
};

export type RsvpPayload = {
  nombre: string;
  telefono: string;
  asiste: boolean;
  viene_de_blanco: boolean;
  cancion?: string;
  mensaje?: string;
  idioma: "es" | "en";
  consentimiento: boolean;
  personas: Persona[];
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const rsvpConfigurado = Boolean(URL && KEY);

const MUSIC_LINK = /^https?:\/\/(open\.spotify\.com|spotify\.link|music\.youtube\.com|www\.youtube\.com|youtube\.com|youtu\.be)\//i;

/** Válido si es un título libre o un enlace de Spotify/YouTube. */
export function cancionValida(v: string) {
  const s = v.trim();
  return s.length <= 200 && (!/^https?:\/\//i.test(s) || MUSIC_LINK.test(s));
}

// Única vía de escritura: la función RPC `enviar_rsvp` de Supabase.
export async function enviarRsvp(payload: RsvpPayload): Promise<void> {
  if (!URL || !KEY) throw new Error("not-configured");
  const res = await fetch(`${URL}/rest/v1/rpc/enviar_rsvp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: KEY, Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ payload }),
  });
  if (!res.ok) throw new Error(`http-${res.status}`);
}
