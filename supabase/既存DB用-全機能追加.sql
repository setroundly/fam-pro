-- ============================================================
-- 既存DB向け: リンク保存 + レシピ写真（まとめて1回実行）
-- schema.sql 全体は実行しない（users already exists エラー）
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- リンク保存
create table if not exists public.family_links (
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

create index if not exists family_links_family_created_idx
  on public.family_links(family_id, created_at desc);

alter table public.family_links enable row level security;

do $$ begin
  create policy "family_links_all" on public.family_links for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

drop trigger if exists family_links_updated_at on public.family_links;
create trigger family_links_updated_at
before update on public.family_links
for each row execute function public.set_updated_at();

-- レシピ写真
alter table public.recipes
  add column if not exists photo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-photos',
  'recipe-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$ begin
  create policy "recipe_photos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'recipe-photos');
exception when duplicate_object then null;
end $$;
