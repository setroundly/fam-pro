-- 既存DB向け: レシピ写真機能
-- schema.sql 全体は実行しないこと

alter table public.recipes
  add column if not exists photo_url text;

-- Supabase Storage バケット（公開読み取り）
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
