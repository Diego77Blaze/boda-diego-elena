-- Panel de administración. Ejecutar DESPUÉS de 001_rsvp.sql (no borra datos, se puede repetir).
-- Antes: crea tu usuario en Supabase → Authentication → Users → Add user
-- (con "Auto Confirm User" marcado) y sustituye TU_EMAIL abajo.

create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

insert into public.admins (email) values (lower('TU_EMAIL'))
on conflict do nothing;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.admin_listar()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(
      to_jsonb(r) || jsonb_build_object('personas', coalesce((
        select jsonb_agg(to_jsonb(p) order by p.orden)
        from public.rsvp_personas p where p.rsvp_id = r.id
      ), '[]'::jsonb))
      order by r.created_at desc
    )
    from public.rsvps r
  ), '[]'::jsonb);
end;
$$;

create or replace function public.admin_borrar(rsvp uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  delete from public.rsvps where id = rsvp;
end;
$$;

revoke all on function public.es_admin() from public, anon;
revoke all on function public.admin_listar() from public, anon;
revoke all on function public.admin_borrar(uuid) from public, anon;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.admin_listar() to authenticated;
grant execute on function public.admin_borrar(uuid) to authenticated;
