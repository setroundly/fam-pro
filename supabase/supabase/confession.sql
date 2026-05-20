-- 懺悔室（掲示板）— schema.sql 実行後に SQL Editor で実行

create table public.confession_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  display_name text not null check (char_length(display_name) between 1 and 32),
  body text not null check (char_length(body) between 1 and 800),
  parent_id uuid references public.confession_posts(id) on delete cascade,
  comfort_count integer not null default 0 check (comfort_count >= 0),
  created_at timestamptz not null default now()
);

create index confession_posts_parent_idx on public.confession_posts(parent_id);
create index confession_posts_created_idx on public.confession_posts(created_at desc);
create index confession_posts_root_idx on public.confession_posts(created_at desc)
  where parent_id is null;

create table public.confession_comforts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.confession_posts(id) on delete cascade,
  client_key text not null,
  created_at timestamptz not null default now(),
  unique (post_id, client_key)
);

create index confession_comforts_post_idx on public.confession_comforts(post_id);

create or replace function public.increment_confession_comfort(p_post_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.confession_posts
  set comfort_count = comfort_count + 1
  where id = p_post_id
  returning comfort_count into v_count;
  return coalesce(v_count, 0);
end;
$$;

alter table public.confession_posts enable row level security;
alter table public.confession_comforts enable row level security;

create policy "confession read all" on public.confession_posts for select using (true);
create policy "confession insert" on public.confession_posts for insert with check (true);
create policy "confession comfort read" on public.confession_comforts for select using (true);
create policy "confession comfort insert" on public.confession_comforts for insert with check (true);
