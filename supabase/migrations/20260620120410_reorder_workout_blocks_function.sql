-- Atomically reassigns order_index for a workout's blocks given the full
-- desired order. Updates each block twice (to a negative scratch value,
-- then to its final index) to avoid transient collisions with the
-- unique(workout_id, order_index) constraint when indices are swapped.
create or replace function public.reorder_workout_blocks(
  p_workout_id uuid,
  p_block_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_owned boolean;
  v_id uuid;
  v_index int;
begin
  select exists (
    select 1 from public.workouts w
    where w.id = p_workout_id and w.user_id = auth.uid()
  ) into v_owned;

  if not v_owned then
    raise exception 'Workout not found or not owned by current user';
  end if;

  v_index := 1;
  foreach v_id in array p_block_ids
  loop
    update public.workout_blocks
    set order_index = -v_index
    where id = v_id and workout_id = p_workout_id;
    v_index := v_index + 1;
  end loop;

  v_index := 0;
  foreach v_id in array p_block_ids
  loop
    update public.workout_blocks
    set order_index = v_index
    where id = v_id and workout_id = p_workout_id;
    v_index := v_index + 1;
  end loop;
end;
$$;
