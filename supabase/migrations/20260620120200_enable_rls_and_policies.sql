alter table public.exercises enable row level security;
alter table public.spring_types enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_blocks enable row level security;
alter table public.workout_block_springs enable row level security;

-- exercises: direct ownership ----------------------------------------------
create policy "exercises_select_own" on public.exercises
  for select using (auth.uid() = user_id);
create policy "exercises_insert_own" on public.exercises
  for insert with check (auth.uid() = user_id);
create policy "exercises_update_own" on public.exercises
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercises_delete_own" on public.exercises
  for delete using (auth.uid() = user_id);

-- spring_types: direct ownership --------------------------------------------
create policy "spring_types_select_own" on public.spring_types
  for select using (auth.uid() = user_id);
create policy "spring_types_insert_own" on public.spring_types
  for insert with check (auth.uid() = user_id);
create policy "spring_types_update_own" on public.spring_types
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "spring_types_delete_own" on public.spring_types
  for delete using (auth.uid() = user_id);

-- workouts: direct ownership -------------------------------------------------
create policy "workouts_select_own" on public.workouts
  for select using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts
  for insert with check (auth.uid() = user_id);
create policy "workouts_update_own" on public.workouts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workouts_delete_own" on public.workouts
  for delete using (auth.uid() = user_id);

-- workout_blocks: ownership via parent workout -------------------------------
create policy "workout_blocks_select_via_workout" on public.workout_blocks
  for select using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_blocks.workout_id
        and w.user_id = auth.uid()
    )
  );
create policy "workout_blocks_insert_via_workout" on public.workout_blocks
  for insert with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_blocks.workout_id
        and w.user_id = auth.uid()
    )
  );
create policy "workout_blocks_update_via_workout" on public.workout_blocks
  for update using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_blocks.workout_id
        and w.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_blocks.workout_id
        and w.user_id = auth.uid()
    )
  );
create policy "workout_blocks_delete_via_workout" on public.workout_blocks
  for delete using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_blocks.workout_id
        and w.user_id = auth.uid()
    )
  );

-- workout_block_springs: ownership via grandparent workout (two-level join) --
create policy "wbs_select_via_block_workout" on public.workout_block_springs
  for select using (
    exists (
      select 1
      from public.workout_blocks wb
      join public.workouts w on w.id = wb.workout_id
      where wb.id = workout_block_springs.workout_block_id
        and w.user_id = auth.uid()
    )
  );
create policy "wbs_insert_via_block_workout" on public.workout_block_springs
  for insert with check (
    exists (
      select 1
      from public.workout_blocks wb
      join public.workouts w on w.id = wb.workout_id
      where wb.id = workout_block_springs.workout_block_id
        and w.user_id = auth.uid()
    )
  );
create policy "wbs_update_via_block_workout" on public.workout_block_springs
  for update using (
    exists (
      select 1
      from public.workout_blocks wb
      join public.workouts w on w.id = wb.workout_id
      where wb.id = workout_block_springs.workout_block_id
        and w.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.workout_blocks wb
      join public.workouts w on w.id = wb.workout_id
      where wb.id = workout_block_springs.workout_block_id
        and w.user_id = auth.uid()
    )
  );
create policy "wbs_delete_via_block_workout" on public.workout_block_springs
  for delete using (
    exists (
      select 1
      from public.workout_blocks wb
      join public.workouts w on w.id = wb.workout_id
      where wb.id = workout_block_springs.workout_block_id
        and w.user_id = auth.uid()
    )
  );
