-- Exercises become a shared library: any authenticated user can read every
-- exercise, but only the creator can insert/update/delete their own rows.
drop policy if exists "exercises_select_own" on public.exercises;

create policy "exercises_select_all" on public.exercises
  for select using (auth.uid() is not null);
