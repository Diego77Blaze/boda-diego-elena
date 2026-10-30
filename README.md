# Boda Diego & Elena

Web de invitación (Fase 1: sobre interactivo, portada y cuenta atrás). Next.js + TypeScript + Tailwind + Motion, exportada como sitio estático.

```bash
npm install
npm run dev      # desarrollo en http://localhost:3000
npm run ver      # igual, pero abre Chrome automáticamente
npm run build    # genera ./out
```

## Publicar gratis en GitHub Pages (sin dominio)

1. Crea un repositorio en GitHub (p. ej. `boda`) y sube el código a la rama `main`.
2. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
3. Cada push a `main` ejecuta `.github/workflows/deploy.yml` y publica en `https://<usuario>.github.io/<repo>/`.

El `basePath` se configura solo en el workflow con el nombre del repositorio. Si usas un repositorio llamado `<usuario>.github.io`, elimina la variable `NEXT_PUBLIC_BASE_PATH` del workflow.

Nota: GitHub Pages es solo hosting estático; el RSVP, la base de datos y el panel (fases 3-4) se conectarán a Supabase.

## Base de datos (confirmaciones de asistencia)

1. Crea un proyecto gratis en https://supabase.com (región UE, p. ej. Frankfurt).
2. En **SQL Editor** pega y ejecuta `supabase/migrations/001_rsvp.sql`.
3. En **Project Settings > API** copia la *Project URL* y la clave *anon public*.
4. Local: copia `.env.example` a `.env.local` y rellénalo.
5. GitHub: Settings > Secrets and variables > Actions > **Variables**: `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

Las tablas no son accesibles con la clave pública: solo se puede enviar una respuesta mediante la función `enviar_rsvp`. Las respuestas se consultan en el panel de Supabase (vista `rsvp_resumen`).

