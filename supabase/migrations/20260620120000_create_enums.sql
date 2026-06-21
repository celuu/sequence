-- Enums used by exercises and workout_blocks
do $$ begin
  create type exercise_difficulty as enum ('beginner', 'intermediate', 'advanced');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type workout_block_side as enum ('left', 'right', 'both', 'none');
exception
  when duplicate_object then null;
end $$;
