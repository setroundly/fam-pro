-- FAIL DONATE schema
create extension if not exists "pgcrypto";

create type task_status as enum ('pending', 'completed', 'failed');
create type notification_channel as enum ('email', 'line');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 32),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  deadline_at timestamptz not null,
  penalty_amount integer not null check (penalty_amount > 0),
  donation_destination text not null,
  donate_url text,
  status task_status not null default 'pending',
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_status_deadline_idx on public.tasks(status, deadline_at);
create index tasks_failed_at_idx on public.tasks(failed_at desc) where status = 'failed';

create table public.timeline_posts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  display_name text not null,
  task_title text not null,
  penalty_amount integer not null,
  donation_destination text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create unique index timeline_posts_task_id_uq on public.timeline_posts(task_id);
create index timeline_posts_created_at_idx on public.timeline_posts(created_at desc);

create table public.notification_targets (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  type notification_channel not null default 'email',
  label text not null,
  destination text not null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (task_id, type, destination)
);

create index notification_targets_task_id_idx on public.notification_targets(task_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create or replace function public.build_fail_body(
  p_display_name text,
  p_task_title text,
  p_penalty_amount integer
) returns text language sql immutable as $$
  select format(
    '%s が『%s』に失敗しました。%s円寄付予定です。',
    p_display_name,
    p_task_title,
    p_penalty_amount::text
  );
$$;

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
end;
$$;

create or replace function public.fail_overdue_tasks()
returns setof uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select id from public.tasks
    where status = 'pending' and deadline_at <= now()
    order by deadline_at asc
    limit 100
  loop
    perform public.fail_task(r.id);
    return next r.id;
  end loop;
end;
$$;

create or replace function public.get_consecutive_fail_count(p_user_id uuid)
returns integer
language sql
stable
as $$
  with ordered as (
    select
      status,
      row_number() over (
        order by coalesce(failed_at, completed_at, created_at) desc
      ) as rn
    from public.tasks
    where user_id = p_user_id
      and status in ('completed', 'failed')
  ),
  first_success as (
    select coalesce(min(rn), 2147483647) as rn from ordered where status = 'completed'
  )
  select count(*)::int
  from ordered, first_success fs
  where ordered.status = 'failed'
    and ordered.rn < fs.rn;
$$;

create or replace view public.today_failures as
select
  tp.id,
  tp.task_id,
  tp.user_id,
  tp.display_name,
  tp.task_title,
  tp.penalty_amount,
  tp.donation_destination,
  tp.body,
  tp.created_at
from public.timeline_posts tp
where tp.created_at >= date_trunc('day', now() at time zone 'Asia/Tokyo')
  and tp.created_at < date_trunc('day', now() at time zone 'Asia/Tokyo') + interval '1 day'
order by tp.created_at desc;

alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.timeline_posts enable row level security;
alter table public.notification_targets enable row level security;

create policy "timeline read all" on public.timeline_posts for select using (true);
create policy "users insert" on public.users for insert with check (true);
create policy "users select" on public.users for select using (true);
create policy "tasks insert" on public.tasks for insert with check (true);
create policy "tasks select" on public.tasks for select using (true);
create policy "tasks update pending" on public.tasks for update
  using (status = 'pending')
  with check (status in ('pending', 'completed'));
create policy "notification_targets insert" on public.notification_targets for insert with check (true);
create policy "notification_targets select" on public.notification_targets for select using (true);

-- Realtime タイムラインは failures テーブルを使用（supabase/failures.sql を実行）
