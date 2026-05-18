-- failures テーブル + Realtime（Vercel Cron 不要構成）
-- Supabase SQL Editor で schema.sql / confession.sql の後に実行

create table if not exists public.failures (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 1 and 500),
  donation_amount integer not null check (donation_amount > 0),
  user_name text not null default '匿名' check (char_length(user_name) between 1 and 32),
  task_id uuid unique references public.tasks(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  donation_destination text,
  donate_url text
);

create index if not exists failures_created_at_idx
  on public.failures(created_at desc);

create index if not exists failures_user_id_idx
  on public.failures(user_id);

-- 既存 timeline_posts を failures へ移行（初回のみ）
insert into public.failures (
  id,
  created_at,
  title,
  description,
  donation_amount,
  user_name,
  task_id,
  user_id,
  donation_destination
)
select
  tp.id,
  tp.created_at,
  tp.task_title,
  tp.body,
  tp.penalty_amount,
  tp.display_name,
  tp.task_id,
  tp.user_id,
  tp.donation_destination
from public.timeline_posts tp
on conflict (id) do nothing;

-- fail_task: timeline_posts と failures の両方へ（互換維持）
create or replace function public.fail_task(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks%rowtype;
  v_user public.users%rowtype;
  v_body text;
begin
  select * into v_task from public.tasks where id = p_task_id for update;
  if not found or v_task.status <> 'pending' then
    return;
  end if;
  if v_task.deadline_at > now() then
    return;
  end if;

  select * into v_user from public.users where id = v_task.user_id;

  update public.tasks
  set status = 'failed', failed_at = now()
  where id = p_task_id;

  v_body := public.build_fail_body(
    v_user.display_name,
    v_task.title,
    v_task.penalty_amount
  );

  insert into public.timeline_posts (
    task_id, user_id, display_name, task_title,
    penalty_amount, donation_destination, body
  ) values (
    v_task.id, v_user.id, v_user.display_name, v_task.title,
    v_task.penalty_amount, v_task.donation_destination, v_body
  )
  on conflict (task_id) do nothing;

  insert into public.failures (
    task_id,
    user_id,
    user_name,
    title,
    description,
    donation_amount,
    donation_destination,
    donate_url
  ) values (
    v_task.id,
    v_user.id,
    v_user.display_name,
    v_task.title,
    v_body,
    v_task.penalty_amount,
    v_task.donation_destination,
    v_task.donate_url
  )
  on conflict (task_id) do nothing;
end;
$$;

alter table public.failures enable row level security;

drop policy if exists "failures read all" on public.failures;
create policy "failures read all" on public.failures
  for select using (true);

drop policy if exists "failures insert all" on public.failures;
create policy "failures insert all" on public.failures
  for insert with check (true);

-- Realtime（Dashboard → Database → Replication でも failures を ON に）
do $$
begin
  alter publication supabase_realtime add table public.failures;
exception
  when duplicate_object then null;
end $$;
