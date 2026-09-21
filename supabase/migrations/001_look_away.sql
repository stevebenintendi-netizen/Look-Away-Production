create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  accountability_email text not null default '',
  joined_date text not null default to_char(current_date, 'Mon DD, YYYY'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.engagements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp timestamptz not null,
  date_str text not null,
  time_str text not null,
  score smallint not null check (score between 1 and 4),
  score_label text not null,
  feelings jsonb not null default '[]'::jsonb,
  locations jsonb not null default '[]'::jsonb,
  attire jsonb not null default '[]'::jsonb,
  eyes_went_to jsonb not null default '[]'::jsonb,
  her_build jsonb not null default '[]'::jsonb,
  hair_color text not null default '',
  comments text not null default '',
  triggers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  start_date date not null,
  end_date date not null,
  email_to_send text not null,
  secondary_email_to_send text not null default '',
  phone_to_send text not null default '',
  general_comments text not null default '',
  triggers jsonb not null default '[]'::jsonb
);

alter table public.profiles enable row level security;
alter table public.engagements enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profiles are private" on public.profiles;
create policy "profiles are private" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "engagements are private" on public.engagements;
create policy "engagements are private" on public.engagements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reports are private" on public.reports;
create policy "reports are private" on public.reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, accountability_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
