import { supabase } from "../../lib/supabase/client";
import { createExercise } from "../exercises/api";
import type { DraftExercise, ParsedExerciseList } from "./types";

export async function parseExerciseList(
  text: string,
  existingExercises: { name: string }[],
): Promise<ParsedExerciseList> {
  const { data, error } = await supabase.functions.invoke<ParsedExerciseList>(
    "parse-exercise-list",
    { body: { text, existingExercises } },
  );
  if (error) throw error;
  if (!data) throw new Error("Received an empty response from the parser.");
  return data;
}

export async function commitExerciseImport(
  userId: string,
  draftExercises: DraftExercise[],
): Promise<number> {
  const toCreate = draftExercises.filter(
    (draft) => draft.status === "create" && draft.name.trim(),
  );

  let created = 0;
  for (const draft of toCreate) {
    await createExercise(userId, {
      name: draft.name.trim(),
      category: draft.category,
      muscleGroups: draft.muscleGroups,
      difficulty: draft.difficulty,
      defaultDurationSeconds: null,
      notes: draft.notes,
    });
    created += 1;
  }
  return created;
}
