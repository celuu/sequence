import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exercisesQueryKey } from "../exercises/hooks";
import { commitExerciseImport, parseExerciseList } from "./api";
import type { DraftExercise } from "./types";

export function useParseExerciseList() {
  return useMutation({
    mutationFn: ({
      text,
      existingExercises,
    }: {
      text: string;
      existingExercises: { name: string }[];
    }) => parseExerciseList(text, existingExercises),
  });
}

export function useCommitExerciseImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      draftExercises,
    }: {
      userId: string;
      draftExercises: DraftExercise[];
    }) => commitExerciseImport(userId, draftExercises),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exercisesQueryKey });
    },
  });
}
