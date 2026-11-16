-- 원세 ♥ 소현 모바일 청첩장 (Supabase project "numugas", shared with another app).
--
-- Everything lives in its own `wedding` schema so it never mixes with the other app. The tables
-- are not exposed through the Data API; the site's server only calls the public.wedding_*
-- functions below. Guestbook passwords and the time-capsule key are checked inside the database,
-- so even someone holding the project's public anon key can't read password hashes, delete other
-- people's entries, or open the capsule.

create schema if not exists wedding;
revoke all on schema wedding from public, anon, authenticated;

create table wedding.guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  message text not null check (char_length(message) between 1 and 500),
  password_hash text not null,
  created_at timestamptz not null default now()
);
create index guestbook_created_at_idx on wedding.guestbook (created_at desc);

create table wedding.photo_likes (
  photo text primary key check (photo ~ '^[A-Za-z0-9_-]{1,40}$'),
  count integer not null default 0 check (count >= 0)
);

create table wedding.counters (
  key text primary key,
  value bigint not null default 0
);
insert into wedding.counters (key) values ('cheers');

create table wedding.capsule_letters (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- Single row: when the time capsule opens (keep in sync with guestbook.timeCapsule.opensAt in
-- src/config/invitation.ts) and the bcrypt hash of the couple's key (null = cannot be opened).
create table wedding.capsule_settings (
  id boolean primary key default true check (id),
  opens_at timestamptz not null,
  key_hash text
);
insert into wedding.capsule_settings (opens_at) values ('2028-02-27 00:00:00+09');

alter table wedding.guestbook enable row level security;
alter table wedding.photo_likes enable row level security;
alter table wedding.counters enable row level security;
alter table wedding.capsule_letters enable row level security;
alter table wedding.capsule_settings enable row level security;

-- ── guestbook ──────────────────────────────────────────────
create function public.wedding_guestbook_list()
returns table (id uuid, name text, message text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select g.id, g.name, g.message, g.created_at from wedding.guestbook g order by g.created_at desc;
$$;

create function public.wedding_guestbook_add(p_name text, p_message text, p_password text)
returns table (id uuid, name text, message text, created_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
begin
  if char_length(coalesce(p_password, '')) not between 4 and 20 then
    raise exception 'invalid_password';
  end if;
  return query
    insert into wedding.guestbook as g (name, message, password_hash)
    values (btrim(p_name), btrim(p_message), extensions.crypt(p_password, extensions.gen_salt('bf', 8)))
    returning g.id, g.name, g.message, g.created_at;
end;
$$;

-- 'ok' | 'not_found' | 'forbidden'
create function public.wedding_guestbook_delete(p_id uuid, p_password text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_hash text;
begin
  select g.password_hash into v_hash from wedding.guestbook g where g.id = p_id;
  if not found then
    return 'not_found';
  end if;
  if v_hash <> extensions.crypt(coalesce(p_password, ''), v_hash) then
    return 'forbidden';
  end if;
  delete from wedding.guestbook g where g.id = p_id;
  return 'ok';
end;
$$;

-- ── gallery likes & footer cheers ──────────────────────────
create function public.wedding_likes()
returns table (photo text, count integer)
language sql stable security definer set search_path = ''
as $$
  select l.photo, l.count from wedding.photo_likes l where l.count > 0;
$$;

create function public.wedding_like(p_photo text, p_delta integer)
returns integer
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_count integer;
begin
  if p_delta not in (-1, 1) then
    raise exception 'invalid_delta';
  end if;
  insert into wedding.photo_likes as l (photo, count) values (p_photo, greatest(p_delta, 0))
  on conflict (photo) do update set count = greatest(l.count + p_delta, 0)
  returning l.count into v_count;
  return v_count;
end;
$$;

create function public.wedding_cheers()
returns bigint
language sql stable security definer set search_path = ''
as $$
  select c.value from wedding.counters c where c.key = 'cheers';
$$;

-- Taps arrive in batches; one call adds at most 30.
create function public.wedding_add_cheers(p_count integer)
returns bigint
language sql security definer set search_path = ''
as $$
  update wedding.counters c set value = c.value + least(greatest(p_count, 1), 30)
  where c.key = 'cheers'
  returning c.value;
$$;

-- ── 1st-anniversary time capsule ───────────────────────────
create function public.wedding_capsule_count()
returns integer
language sql stable security definer set search_path = ''
as $$
  select count(*)::integer from wedding.capsule_letters;
$$;

create function public.wedding_capsule_add(p_name text, p_message text)
returns integer
language plpgsql security definer set search_path = ''
as $$
begin
  insert into wedding.capsule_letters (name, message) values (btrim(p_name), btrim(p_message));
  return (select count(*)::integer from wedding.capsule_letters);
end;
$$;

-- Letters come out only after opens_at and only with the right key.
create function public.wedding_capsule_open(p_key text)
returns table (id uuid, name text, message text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_opens_at timestamptz;
  v_hash text;
begin
  select s.opens_at, s.key_hash into v_opens_at, v_hash from wedding.capsule_settings s;
  if now() < v_opens_at then
    raise exception 'capsule_not_open_yet';
  end if;
  if v_hash is null or v_hash <> extensions.crypt(coalesce(p_key, ''), v_hash) then
    raise exception 'capsule_wrong_key';
  end if;
  return query
    select l.id, l.name, l.message, l.created_at from wedding.capsule_letters l order by l.created_at;
end;
$$;

-- Only the anonymous API role (the site's server) may call these; signed-in users of the other app may not.
revoke all on function
  public.wedding_guestbook_list(),
  public.wedding_guestbook_add(text, text, text),
  public.wedding_guestbook_delete(uuid, text),
  public.wedding_likes(),
  public.wedding_like(text, integer),
  public.wedding_cheers(),
  public.wedding_add_cheers(integer),
  public.wedding_capsule_count(),
  public.wedding_capsule_add(text, text),
  public.wedding_capsule_open(text)
from public, anon, authenticated;

grant execute on function
  public.wedding_guestbook_list(),
  public.wedding_guestbook_add(text, text, text),
  public.wedding_guestbook_delete(uuid, text),
  public.wedding_likes(),
  public.wedding_like(text, integer),
  public.wedding_cheers(),
  public.wedding_add_cheers(integer),
  public.wedding_capsule_count(),
  public.wedding_capsule_add(text, text),
  public.wedding_capsule_open(text)
to anon, service_role;
