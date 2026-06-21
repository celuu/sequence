import { supabase } from "../../lib/supabase/client";
import type { Workout } from "../../types/domain";

const WORKOUT_COLUMNS =
  "id, userId:user_id, name, description, totalDurationSeconds:total_duration_seconds, createdAt:created_at, updatedAt:updated_at";

export interface WorkoutInput {
  name: string;
  description: string | null;
}

export async function listWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase
    .from("workouts")
    .select(WORKOUT_COLUMNS)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as unknown as Workout[];
}

export async function createWorkout(
  userId: string,
  input: WorkoutInput,
): Promise<Workout> {
  const { data, error } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description,
    })
    .select(WORKOUT_COLUMNS)
    .single();
  if (error) throw error;
  return data as unknown as Workout;
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateWorkout(workoutId: string): Promise<string> {
  const { data, error } = await supabase.rpc("duplicate_workout", {
    p_workout_id: workoutId,
  });
  if (error) throw error;
  return data as string;
}
