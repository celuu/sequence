-- Deep-copies a workout (blocks + their springs) into a new workout owned
-- by the same user. security invoker so RLS still applies per-statement —
-- a workout the caller can't see simply yields no rows, which we treat as
-- "not found or not owned" rather than silently succeeding.
create or replace function public.duplicate_workout(p_workout_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_new_workout_id uuid;
  v_block record;
  v_new_block_id uuid;
begin
  insert into public.workouts (user_id, name, description, total_duration_seconds)
  select user_id, name || ' (Copy)', description, total_duration_seconds
  from public.workouts
  where id = p_workout_id
  returning id into v_new_workout_id;

  if v_new_workout_id is null then
    raise exception 'Workout not found or not owned by current user';
  end if;

  for v_block in
    select * from public.workout_blocks
    where workout_id = p_workout_id
    order by order_index
  loop
    insert into public.workout_blocks
      (workout_id, exercise_id, order_index, duration_seconds, side, notes)
    values
      (v_new_workout_id, v_block.exercise_id, v_block.order_index, v_block.duration_seconds, v_block.side, v_block.notes)
    returning id into v_new_block_id;

    insert into public.workout_block_springs (workout_block_id, spring_type_id, count)
    select v_new_block_id, spring_type_id, count
    from public.workout_block_springs
    where workout_block_id = v_block.id;
  end loop;

  return v_new_workout_id;
end;
$$;
