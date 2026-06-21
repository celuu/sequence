create extension if not exists "pgcrypto";

-- exercises ------------------------------------------------------------
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  muscle_groups text[],
  difficulty exercise_difficulty,
  default_duration_seconds integer check (default_duration_seconds is null or default_duration_seconds > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists exercises_user_id_idx on public.exercises(user_id);
create index if not exists exercises_user_id_name_idx on public.exercises(user_id, name);

-- spring_types -----------------------------------------------------------
create table if not exists public.spring_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color_hex text check (color_hex is null or color_hex ~* '^#[0-9a-f]{6}$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
create index if not exists spring_types_user_id_idx on public.spring_types(user_id);

-- workouts ---------------------------------------------------------------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  total_duration_seconds integer check (total_duration_seconds is null or total_duration_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workouts_user_id_idx on public.workouts(user_id);
create index if not exists workouts_user_id_updated_at_idx on public.workouts(user_id, updated_at desc);

-- workout_blocks -----------------------------------------------------------
create table if not exists public.workout_blocks (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  order_index integer not null,
  duration_seconds integer not null check (duration_seconds > 0),
  side workout_block_side not null default 'none',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_id, order_index)
);
create index if not exists workout_blocks_workout_id_idx on public.workout_blocks(workout_id);
create index if not exists workout_blocks_exercise_id_idx on public.workout_blocks(exercise_id);

-- workout_block_springs -----------------------------------------------------
create table if not exists public.workout_block_springs (
  id uuid primary key default gen_random_uuid(),
  workout_block_id uuid not null references public.workout_blocks(id) on delete cascade,
  spring_type_id uuid not null references public.spring_types(id) on delete restrict,
  count integer not null check (count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_block_id, spring_type_id)
);
create index if not exists workout_block_springs_block_id_idx on public.workout_block_springs(workout_block_id);
create index if not exists workout_block_springs_spring_type_id_idx on public.workout_block_springs(spring_type_id);
