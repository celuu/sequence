import { supabase } from "../../lib/supabase/client";
import type { Difficulty, Exercise } from "../../types/domain";

const EXERCISE_COLUMNS =
  "id, userId:user_id, name, category, muscleGroups:muscle_groups, difficulty, defaultDurationSeconds:default_duration_seconds, notes, createdAt:created_at, updatedAt:updated_at";

export interface ExerciseInput {
  name: string;
  category: string | null;
  muscleGroups: string[] | null;
  difficulty: Difficulty | null;
  defaultDurationSeconds: number | null;
  notes: string | null;
}

export class ExerciseInUseError extends Error {}

export async function listExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("exercises")
    .select(EXERCISE_COLUMNS)
    .order("name");
  if (error) throw error;
  return data as unknown as Exercise[];
}

export async function createExercise(
  userId: string,
  input: ExerciseInput,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: userId,
      name: input.name,
      category: input.category,
      muscle_groups: input.muscleGroups,
      difficulty: input.difficulty,
      default_duration_seconds: input.defaultDurationSeconds,
      notes: input.notes,
    })
    .select(EXERCISE_COLUMNS)
    .single();
  if (error) throw error;
  return data as unknown as Exercise;
}

export async function updateExercise(
  id: string,
  input: ExerciseInput,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("exercises")
    .update({
      name: input.name,
      category: input.category,
      muscle_groups: input.muscleGroups,
      difficulty: input.difficulty,
      default_duration_seconds: input.defaultDurationSeconds,
      notes: input.notes,
    })
    .eq("id", id)
    .select(EXERCISE_COLUMNS)
    .single();
  if (error) throw error;
  return data as unknown as Exercise;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new ExerciseInUseError(
        "Can't delete — this exercise is used in one or more workouts.",
      );
    }
    throw error;
  }
}
