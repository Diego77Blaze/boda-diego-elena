-- Confirmaciones de asistencia (RSVP) de la boda de Diego & Elena.
-- Supabase: SQL Editor > New query > pegar todo > Run.
-- Es re-ejecutable: BORRA las tablas anteriores y las recrea (úsalo solo antes de recibir respuestas reales).

drop view if exists public.rsvp_totales;
drop view if exists public.rsvp_resumen;
drop function if exists public.enviar_rsvp(jsonb);
drop table if exists public.rsvp_personas;
drop table if exists public.rsvps;

create extension if not exists pgcrypto;

-- Una fila por respuesta: la envía UNA persona en nombre de su pareja/familia/grupo.
create table public.rsvps (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  nombre          text not null check (char_length(nombre) between 1 and 100),
  telefono        text not null check (char_length(telefono) between 6 and 30),
  asiste          boolean not null,
  -- Pregunta de broma "¿vienes de blanco?": si es true, queda desinvitado/a.
  viene_de_blanco boolean not null default false,
  desinvitado     boolean generated always as (viene_de_blanco) stored,
  -- Enlace de Spotify/YouTube o simplemente el título de la canción.
  cancion         text check (cancion is null or (
                    char_length(cancion) <= 200 and (
                      cancion !~* '^https?://'
                      or cancion ~* '^https?://(open\.spotify\.com|spotify\.link|music\.youtube\.com|www\.youtube\.com|youtube\.com|youtu\.be)/'
                    ))),
  mensaje         text check (mensaje is null or char_length(mensaje) <= 1000),
  idioma          text not null default 'es' check (idioma in ('es', 'en')),
  consentimiento  boolean not null check (consentimiento)
);

-- Una fila por persona que asiste (incluida quien responde, es_responsable = true).
-- Cada una con su menú y sus alérgenos; los menores se marcan con es_menor.
create table public.rsvp_personas (
  id             uuid primary key default gen_random_uuid(),
  rsvp_id        uuid not null references public.rsvps(id) on delete cascade,
  orden          smallint not null default 0,
  nombre         text not null check (char_length(nombre) between 1 and 100),
  es_responsable boolean not null default false,
  es_menor       boolean not null default false,
  edad           smallint check (edad is null or edad between 0 and 17),
  menu           text not null default 'normal' check (menu in ('normal', 'vegetariano', 'vegano', 'infantil')),
  alergenos      text[] not null default '{}'
                 check (alergenos <@ array['gluten','crustaceos','huevo','pescado','cacahuete','soja',
                                           'lactosa','frutos_secos','apio','mostaza','sesamo',
                                           'sulfitos','altramuces','moluscos']),
  otras_alergias text check (otras_alergias is null or char_length(otras_alergias) <= 300),
  check (es_menor or menu <> 'infantil'),
  check (not (es_menor and es_responsable))
);

create index rsvp_personas_rsvp_id_idx on public.rsvp_personas(rsvp_id);
-- Como máximo una persona responsable por respuesta.
create unique index rsvp_un_responsable on public.rsvp_personas(rsvp_id) where es_responsable;

-- Seguridad: RLS activado y SIN políticas ni permisos para la clave pública.
alter table public.rsvps enable row level security;
alter table public.rsvp_personas enable row level security;
revoke all on public.rsvps, public.rsvp_personas from anon, authenticated;

-- Única vía de escritura pública. Payload esperado:
-- { nombre, telefono, asiste, viene_de_blanco, cancion, mensaje, idioma, consentimiento,
--   personas: [{ nombre, es_responsable, es_menor, edad, menu, alergenos[], otras_alergias }] }
create function public.enviar_rsvp(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo_id uuid;
  persona  jsonb;
  i        int := 0;
  total    int;
  asiste_  boolean;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'payload inválido';
  end if;

  asiste_ := (payload->>'asiste')::boolean;
  total   := case when jsonb_typeof(payload->'personas') = 'array'
                  then jsonb_array_length(payload->'personas') else 0 end;

  if asiste_ and (total < 1 or total > 12) then
    raise exception 'número de personas inválido';
  end if;

  -- Freno básico contra abuso.
  if (select count(*) from public.rsvps where created_at > now() - interval '1 minute') > 30 then
    raise exception 'demasiadas solicitudes, inténtalo más tarde';
  end if;

  insert into public.rsvps (nombre, telefono, asiste, viene_de_blanco, cancion, mensaje, idioma, consentimiento)
  values (
    trim(payload->>'nombre'),
    trim(payload->>'telefono'),
    asiste_,
    coalesce((payload->>'viene_de_blanco')::boolean, false),
    nullif(trim(payload->>'cancion'), ''),
    nullif(trim(payload->>'mensaje'), ''),
    coalesce(payload->>'idioma', 'es'),
    coalesce((payload->>'consentimiento')::boolean, false)
  )
  returning id into nuevo_id;

  if asiste_ then
    for persona in select * from jsonb_array_elements(payload->'personas') loop
      insert into public.rsvp_personas
        (rsvp_id, orden, nombre, es_responsable, es_menor, edad, menu, alergenos, otras_alergias)
      values (
        nuevo_id,
        i,
        trim(persona->>'nombre'),
        coalesce((persona->>'es_responsable')::boolean, false),
        coalesce((persona->>'es_menor')::boolean, false),
        nullif(persona->>'edad', '')::smallint,
        coalesce(persona->>'menu', 'normal'),
        coalesce((select array_agg(v) from jsonb_array_elements_text(persona->'alergenos') v), '{}'),
        nullif(trim(persona->>'otras_alergias'), '')
      );
      i := i + 1;
    end loop;
  end if;

  return nuevo_id;
end;
$$;

revoke all on function public.enviar_rsvp(jsonb) from public;
grant execute on function public.enviar_rsvp(jsonb) to anon;

-- Vistas para consultar en el panel de Supabase (no accesibles con la clave pública).
create view public.rsvp_resumen with (security_invoker = true) as
select r.created_at, r.nombre as responde, r.telefono, r.asiste, r.desinvitado,
       p.orden, p.nombre as persona, p.es_menor, p.edad, p.menu, p.alergenos, p.otras_alergias,
       r.cancion, r.mensaje
from public.rsvps r
left join public.rsvp_personas p on p.rsvp_id = r.id
order by r.created_at desc, p.orden;

create view public.rsvp_totales with (security_invoker = true) as
select
  (select count(*) from public.rsvps where asiste)                          as respuestas_asisten,
  (select count(*) from public.rsvps where not asiste)                      as respuestas_no_asisten,
  count(*) filter (where not es_menor)                                      as adultos,
  count(*) filter (where es_menor)                                          as menores,
  count(*) filter (where menu = 'infantil')                                 as menus_infantiles,
  count(*) filter (where menu = 'vegetariano')                              as menus_vegetarianos,
  count(*) filter (where menu = 'vegano')                                   as menus_veganos,
  count(*) filter (where cardinality(alergenos) > 0 or otras_alergias is not null) as personas_con_alergias
from public.rsvp_personas;

revoke all on public.rsvp_resumen, public.rsvp_totales from anon, authenticated;
