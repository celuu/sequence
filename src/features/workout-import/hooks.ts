import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exercisesQueryKey } from "../exercises/hooks";
import { workoutsQueryKey } from "../workouts/hooks";
import { commitImport, parseWorkoutText } from "./api";
import type { DraftBlock } from "./types";

export function useParseWorkoutText() {
  return useMutation({
    mutationFn: ({
      text,
      existingExercises,
    }: {
      text: string;
      existingExercises: { name: string; category: string | null }[];
    }) => parseWorkoutText(text, existingExercises),
  });
}

export function useCommitImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      workoutName,
      draftBlocks,
    }: {
      userId: string;
      workoutName: string;
      draftBlocks: DraftBlock[];
    }) => commitImport(userId, workoutName, draftBlocks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exercisesQueryKey });
      queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
    },
  });
}
