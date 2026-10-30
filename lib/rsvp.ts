export const ALERGENOS = [
  ["gluten", "Gluten"],
  ["lactosa", "Lactosa"],
  ["huevo", "Huevo"],
  ["frutos_secos", "Frutos secos"],
  ["cacahuete", "Cacahuete"],
  ["pescado", "Pescado"],
  ["marisco", "Crustáceos"],
  ["moluscos", "Moluscos"],
  ["soja", "Soja"],
  ["apio", "Apio"],
  ["mostaza", "Mostaza"],
  ["sesamo", "Sésamo"],
  ["sulfitos", "Sulfitos"],
  ["altramuces", "Altramuces"],
] as const;

export type Menu = "normal" | "vegetariano" | "vegano" | "infantil";

export type Persona = {
  nombre: string;
  es_menor?: boolean;
  menu?: Menu;
  alergenos?: string[];
  otras_alergias?: string;
};

export type RsvpPayload = {
  nombre: string;
  email?: string;
  telefono?: string;
  asiste: boolean;
  viene_de_blanco?: boolean;
  autobus?: boolean;
  cancion?: string;
  mensaje?: string;
  consentimiento: boolean;
  personas: Persona[];
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Envía la respuesta llamando a la función RPC `enviar_rsvp` (única vía de escritura).
export async function enviarRsvp(payload: RsvpPayload): Promise<void> {
  if (!URL || !KEY) throw new Error("Supabase no está configurado");
  const res = await fetch(`${URL}/rest/v1/rpc/enviar_rsvp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: KEY, Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ payload }),
  });
  if (!res.ok) throw new Error(`Error ${res.status} al enviar la confirmación`);
}
