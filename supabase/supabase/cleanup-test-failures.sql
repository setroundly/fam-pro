-- テスト投稿の削除（Supabase SQL Editor で実行）
-- 手動投稿・テストデータを failures から消す

-- 全件削除（いま入っている test 投稿をまとめて消す場合）
delete from public.failures;

-- タイムライン互換テーブルも空にする場合（任意・コメント外して実行）
-- delete from public.timeline_posts;
