# Sequence

A web app for Lagree instructors to create, save, organize, and reuse workouts — built to cut down the time it takes to build a class and avoid repetitive programming.

## Stack

- React + TypeScript + Vite + Chakra UI v3
- Supabase (Postgres + Auth) via `@supabase/supabase-js` and TanStack Query
- React Router, React Hook Form + Zod, dnd-kit

## Getting started

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and anon key (Project Settings → API):

```bash
cp .env.example .env.local
```

Apply the database migrations to your linked Supabase project:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

In the Supabase dashboard, under Authentication → Providers → Email, disable "Confirm email" so signups log straight in.

Then start the dev server:

```bash
npm run dev
```

## Features

- Exercise library with search/filter
- Custom spring types (defaults: Yellow, Red, Blue, Green)
- Workout builder with drag-and-drop reordering, autosave, and multi-spring blocks per exercise
- One-click workout duplication
- Per-user data isolation via Postgres RLS
