-- 既存DB向け: リンク保存機能（family_links）だけ追加
-- schema.sql 全体は実行しないこと（users already exists エラーになります）
-- 何度実行しても安全（IF NOT EXISTS / duplicate_object 対策済み）

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
