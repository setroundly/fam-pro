-- 既存DB向け: カテゴリ・イベント欄を追加（新規は schema.sql を使用）
create type recipe_category as enum ('staple', 'main', 'side', 'sweets', 'drink');

alter table public.recipes
  add column if not exists category recipe_category not null default 'main';

alter table public.recipes
  add column if not exists events text[] not null default '{}';

create index if not exists recipes_family_category_idx
  on public.recipes(family_id, category);

create index if not exists recipes_events_gin_idx
  on public.recipes using gin(events);
