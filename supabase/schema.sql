-- Unfair Website database schema
-- Run this in Supabase SQL Editor.

create table if not exists public.hug_counter (
  id bigint primary key default 1,
  current_count integer not null default 0 check (current_count >= 0),
  updated_at timestamptz not null default now(),
  constraint single_counter_row check (id = 1)
);

insert into public.hug_counter (id, current_count)
values (1, 0)
on conflict (id) do nothing;

create table if not exists public.hug_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  user_name text not null,
  change_amount integer not null,
  reason text not null,
  counter_after integer not null check (counter_after >= 0),
  created_at timestamptz not null default now()
);

alter table public.hug_counter enable row level security;
alter table public.hug_history enable row level security;

drop policy if exists "Authenticated users can read counter" on public.hug_counter;
create policy "Authenticated users can read counter"
on public.hug_counter for select
to authenticated
using (true);

drop policy if exists "Authenticated users can update counter" on public.hug_counter;
create policy "Authenticated users can update counter"
on public.hug_counter for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can read history" on public.hug_history;
create policy "Authenticated users can read history"
on public.hug_history for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert history" on public.hug_history;
create policy "Authenticated users can insert history"
on public.hug_history for insert
to authenticated
with check (auth.uid() = user_id);

create or replace function public.apply_hug_change(
  change_amount_input integer,
  reason_input text,
  user_name_input text
)
returns table (new_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_count integer;
  calculated_count integer;
  current_user_email text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if reason_input is null or length(trim(reason_input)) = 0 then
    raise exception 'Reason is required';
  end if;

  select email into current_user_email
  from auth.users
  where id = auth.uid();

  select current_count into existing_count
  from public.hug_counter
  where id = 1
  for update;

  calculated_count := greatest(0, existing_count + change_amount_input);

  update public.hug_counter
  set current_count = calculated_count,
      updated_at = now()
  where id = 1;

  insert into public.hug_history (
    user_id,
    user_email,
    user_name,
    change_amount,
    reason,
    counter_after
  ) values (
    auth.uid(),
    coalesce(current_user_email, 'unknown'),
    user_name_input,
    change_amount_input,
    trim(reason_input),
    calculated_count
  );

  return query select calculated_count;
end;
$$;

grant execute on function public.apply_hug_change(integer, text, text) to authenticated;
