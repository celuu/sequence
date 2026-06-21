-- Keeps workouts.total_duration_seconds as a denormalized sum of its blocks'
-- durations, and bumps workouts.updated_at (via the existing set_updated_at
-- trigger) whenever a block is added, removed, reordered, or its duration
-- changes — so the Dashboard's "recently edited" ordering stays accurate.
create or replace function public.recalc_workout_total_duration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workout_id uuid;
begin
  v_workout_id := coalesce(new.workout_id, old.workout_id);

  update public.workouts
  set total_duration_seconds = (
    select coalesce(sum(duration_seconds), 0)
    from public.workout_blocks
    where workout_id = v_workout_id
  )
  where id = v_workout_id;

  return null;
end;
$$;

drop trigger if exists recalc_workout_total_duration on public.workout_blocks;
create trigger recalc_workout_total_duration
  after insert or delete or update of duration_seconds, order_index on public.workout_blocks
  for each row
  execute function public.recalc_workout_total_duration();

-- Spring edits don't affect total duration but should still bump the
-- parent workout's updated_at since they're a meaningful edit.
create or replace function public.touch_workout_via_block_springs()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_block_id uuid;
  v_workout_id uuid;
begin
  v_block_id := coalesce(new.workout_block_id, old.workout_block_id);

  select workout_id into v_workout_id
  from public.workout_blocks
  where id = v_block_id;

  if v_workout_id is not null then
    update public.workouts set updated_at = now() where id = v_workout_id;
  end if;

  return null;
end;
$$;

drop trigger if exists touch_workout_via_block_springs on public.workout_block_springs;
create trigger touch_workout_via_block_springs
  after insert or delete or update on public.workout_block_springs
  for each row
  execute function public.touch_workout_via_block_springs();
