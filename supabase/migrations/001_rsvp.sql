-- Confirmaciones de asistencia (RSVP) de la boda de Diego & Elena.
-- Ejecutar en Supabase: SQL Editor > New query > pegar y Run.

create extension if not exists pgcrypto;

-- Una fila por respuesta enviada (quien rellena el formulario).
create table if not exists public.rsvps (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nombre        text not null check (char_length(nombre) between 1 and 100),
  email         text check (email is null or char_length(email) <= 200),
  telefono      text check (telefono is null or char_length(telefono) <= 30),
  asiste        boolean not null,
  -- Pregunta chistosa: "¿Vienes de blanco?". Si es true, queda desinvitado/a (de broma).
  viene_de_blanco boolean not null default false,
  desinvitado   boolean generated always as (viene_de_blanco) stored,
  autobus       boolean not null default false,
  cancion       text check (cancion is null or char_length(cancion) <= 150),
  mensaje       text check (mensaje is null or char_length(mensaje) <= 1000),
  consentimiento boolean not null default false
);

-- Una fila por persona (incluida quien responde): permite alérgenos individuales.
create table if not exists public.rsvp_personas (
  id           uuid primary key default gen_random_uuid(),
  rsvp_id      uuid not null references public.rsvps(id) on delete cascade,
  nombre       text not null check (char_length(nombre) between 1 and 100),
  es_menor     boolean not null default false,
  menu         text not null default 'normal'
               check (menu in ('normal', 'vegetariano', 'vegano', 'infantil')),
  alergenos    text[] not null default '{}'
               check (alergenos <@ array['gluten','lactosa','huevo','frutos_secos','cacahuete',
                                         'pescado','marisco','soja','apio','mostaza',
                                         'sesamo','sulfitos','altramuces','moluscos']),
  otras_alergias text check (otras_alergias is null or char_length(otras_alergias) <= 300)
);

create index if not exists rsvp_personas_rsvp_id_idx on public.rsvp_personas(rsvp_id);

-- Seguridad: RLS activado y SIN políticas ni permisos para anon.
-- Nadie con la clave pública puede leer ni escribir directamente en las tablas.
alter table public.rsvps enable row level security;
alter table public.rsvp_personas enable row level security;
revoke all on public.rsvps, public.rsvp_personas from anon, authenticated;

-- Única vía de escritura pública: esta función, que valida y limita los datos.
create or replace function public.enviar_rsvp(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo_id uuid;
  persona  jsonb;
  total    int;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'payload inválido';
  end if;

  total := coalesce(jsonb_array_length(payload->'personas'), 0);
  if (payload->>'asiste')::boolean and (total < 1 or total > 10) then
    raise exception 'número de personas inválido';
  end if;

  if (select count(*) from public.rsvps where created_at > now() - interval '1 minute') > 30 then
    raise exception 'demasiadas solicitudes, inténtalo más tarde';
  end if;

  insert into public.rsvps (nombre, email, telefono, asiste, viene_de_blanco,
                            autobus, cancion, mensaje, consentimiento)
  values (
    trim(payload->>'nombre'),
    nullif(trim(payload->>'email'), ''),
    nullif(trim(payload->>'telefono'), ''),
    (payload->>'asiste')::boolean,
    coalesce((payload->>'viene_de_blanco')::boolean, false),
    coalesce((payload->>'autobus')::boolean, false),
    nullif(trim(payload->>'cancion'), ''),
    nullif(trim(payload->>'mensaje'), ''),
    coalesce((payload->>'consentimiento')::boolean, false)
  )
  returning id into nuevo_id;

  if (payload->>'asiste')::boolean then
    for persona in select * from jsonb_array_elements(payload->'personas') loop
      insert into public.rsvp_personas (rsvp_id, nombre, es_menor, menu, alergenos, otras_alergias)
      values (
        nuevo_id,
        trim(persona->>'nombre'),
        coalesce((persona->>'es_menor')::boolean, false),
        coalesce(persona->>'menu', 'normal'),
        coalesce(
          (select array_agg(value) from jsonb_array_elements_text(persona->'alergenos')),
          '{}'
        ),
        nullif(trim(persona->>'otras_alergias'), '')
      );
    end loop;
  end if;

  return nuevo_id;
end;
$$;

revoke all on function public.enviar_rsvp(jsonb) from public;
grant execute on function public.enviar_rsvp(jsonb) to anon;

-- Vista para consultar cómodamente en el panel de Supabase (Table editor).
create or replace view public.rsvp_resumen as
select r.created_at, r.nombre as responde, r.asiste, r.desinvitado, r.autobus,
       p.nombre as persona, p.es_menor, p.menu, p.alergenos, p.otras_alergias,
       r.cancion, r.mensaje
from public.rsvps r
left join public.rsvp_personas p on p.rsvp_id = r.id
order by r.created_at desc;
revoke all on public.rsvp_resumen from anon, authenticated;
