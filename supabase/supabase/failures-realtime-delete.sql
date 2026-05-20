-- Realtime で DELETE イベントに全カラムを含める（任意・削除即時反映が不安定な場合）
alter table public.failures replica identity full;
