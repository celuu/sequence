import { supabase } from "../../lib/supabase/client";
import { createExercise } from "../exercises/api";
import { createBlock } from "../workout-builder/api";
import { createWorkout } from "../workouts/api";
import type { DraftBlock, ParsedImport } from "./types";

export async function parseWorkoutText(
  text: string,
  existingExercises: { name: string; category: string | null }[],
): Promise<ParsedImport> {
  const { data, error } = await supabase.functions.invoke<ParsedImport>(
    "parse-workout",
    { body: { text, existingExercises } },
  );
  if (error) throw error;
  if (!data) throw new Error("Received an empty response from the parser.");
  return data;
}

export async function commitImport(
  userId: string,
  workoutName: string,
  draftBlocks: DraftBlock[],
): Promise<string> {
  const committable = draftBlocks.filter(
    (draft) =>
      draft.status !== "skipped" &&
      draft.durationSeconds != null &&
      draft.durationSeconds > 0,
  );

  const workout = await createWorkout(userId, {
    name: workoutName,
    description: null,
  });

  const exerciseIdByDraftId = new Map<string, string>();
  const createdIdByNormalizedName = new Map<string, string>();
  for (const draft of committable) {
    if (draft.exerciseId) {
      exerciseIdByDraftId.set(draft.id, draft.exerciseId);
      continue;
    }
    const normalizedName = draft.exerciseName.trim().toLowerCase();
    const reusedId = createdIdByNormalizedName.get(normalizedName);
    if (reusedId) {
      exerciseIdByDraftId.set(draft.id, reusedId);
      continue;
    }
    const exercise = await createExercise(userId, {
      name: draft.exerciseName,
      category: draft.category,
      muscleGroups: null,
      difficulty: null,
      defaultDurationSeconds: draft.durationSeconds,
      notes: null,
    });
    createdIdByNormalizedName.set(normalizedName, exercise.id);
    exerciseIdByDraftId.set(draft.id, exercise.id);
  }

  let orderIndex = 0;
  for (const draft of committable) {
    const exerciseId = exerciseIdByDraftId.get(draft.id);
    if (!exerciseId) continue;
    await createBlock(workout.id, orderIndex, {
      exerciseId,
      side: draft.side,
      durationSeconds: draft.durationSeconds!,
      notes: draft.notes,
      springs: [],
    });
    orderIndex += 1;
  }

  return workout.id;
}
