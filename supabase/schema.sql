-- まるっとfam proレシピ: 家族で共有するレシピ帳
--
-- ⚠️ 初回セットアップ専用（空の Supabase プロジェクトに1回だけ実行）
-- すでに users などがある場合は実行しないでください。
-- 追加機能だけ入れたいときは supabase/migration-*.sql を使ってください。
--
create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 32),
  created_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  invite_code text not null unique check (invite_code ~ '^[A-Z2-9]{6}$'),
  created_at timestamptz not null default now()
);

create index families_invite_code_idx on public.families(invite_code);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  joined_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create index family_members_family_id_idx on public.family_members(family_id);
create index family_members_user_id_idx on public.family_members(user_id);

create type recipe_category as enum ('staple', 'main', 'side', 'sweets', 'drink');

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  author_name text not null,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '',
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  prep_minutes integer check (prep_minutes is null or prep_minutes >= 0),
  cook_minutes integer check (cook_minutes is null or cook_minutes >= 0),
  servings integer check (servings is null or servings between 1 and 99),
  category recipe_category not null default 'main',
  events text[] not null default '{}',
  tags text[] not null default '{}',
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_family_id_created_idx on public.recipes(family_id, created_at desc);
create index recipes_family_category_idx on public.recipes(family_id, category);
create index recipes_events_gin_idx on public.recipes using gin(events);

create table public.member_recipe_views (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table public.cooking_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  cooked_by_name text not null,
  cooked_on date not null default current_date,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index cooking_logs_family_date_idx on public.cooking_logs(family_id, cooked_on desc);
create index cooking_logs_recipe_idx on public.cooking_logs(recipe_id, cooked_on desc);

create table public.recipe_requests (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  requester_name text not null,
  title text not null check (char_length(title) between 1 and 80),
  note text not null default '',
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now()
);

create index recipe_requests_family_status_idx
  on public.recipe_requests(family_id, status, created_at desc);

create table public.family_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  event_type text not null default 'other',
  event_date date not null,
  created_at timestamptz not null default now()
);

create index family_events_family_date_idx on public.family_events(family_id, event_date);

create table public.family_links (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  author_name text not null,
  title text not null check (char_length(title) between 1 and 80),
  url text not null check (char_length(url) between 1 and 500),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index family_links_family_created_idx
  on public.family_links(family_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger recipes_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

create trigger family_links_updated_at
before update on public.family_links
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.recipes enable row level security;
alter table public.member_recipe_views enable row level security;
alter table public.cooking_logs enable row level security;
alter table public.recipe_requests enable row level security;
alter table public.family_events enable row level security;
alter table public.family_links enable row level security;

create policy "users_select" on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (true);

create policy "families_select" on public.families for select using (true);
create policy "families_insert" on public.families for insert with check (true);

create policy "family_members_select" on public.family_members for select using (true);
create policy "family_members_insert" on public.family_members for insert with check (true);

create policy "recipes_select" on public.recipes for select using (true);
create policy "recipes_insert" on public.recipes for insert with check (true);
create policy "recipes_update" on public.recipes for update using (true);
create policy "recipes_delete" on public.recipes for delete using (true);

create policy "member_recipe_views_all" on public.member_recipe_views for all using (true) with check (true);
create policy "cooking_logs_all" on public.cooking_logs for all using (true) with check (true);
create policy "recipe_requests_all" on public.recipe_requests for all using (true) with check (true);
create policy "family_events_all" on public.family_events for all using (true) with check (true);
create policy "family_links_all" on public.family_links for all using (true) with check (true);
