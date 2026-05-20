-- 既存DB向け: 調理記録・リクエスト・イベント・既読管理
create table if not exists public.member_recipe_views (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.cooking_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  cooked_by_name text not null,
  cooked_on date not null default current_date,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists cooking_logs_family_date_idx
  on public.cooking_logs(family_id, cooked_on desc);
create index if not exists cooking_logs_recipe_idx
  on public.cooking_logs(recipe_id, cooked_on desc);

create table if not exists public.recipe_requests (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  requester_name text not null,
  title text not null check (char_length(title) between 1 and 80),
  note text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now()
);

create index if not exists recipe_requests_family_status_idx
  on public.recipe_requests(family_id, status, created_at desc);

create table if not exists public.family_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  event_type text not null default 'other',
  event_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists family_events_family_date_idx
  on public.family_events(family_id, event_date);

alter table public.member_recipe_views enable row level security;
alter table public.cooking_logs enable row level security;
alter table public.recipe_requests enable row level security;
alter table public.family_events enable row level security;

create policy "member_recipe_views_all" on public.member_recipe_views for all using (true) with check (true);
create policy "cooking_logs_all" on public.cooking_logs for all using (true) with check (true);
create policy "recipe_requests_all" on public.recipe_requests for all using (true) with check (true);
create policy "family_events_all" on public.family_events for all using (true) with check (true);
