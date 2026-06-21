import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WorkoutDetail } from "../../types/domain";
import { workoutsQueryKey } from "../workouts/hooks";
import {
  createBlock,
  deleteBlock,
  getWorkoutDetail,
  reorderBlocks,
  updateBlock,
  updateWorkoutMeta,
  type BlockInput,
} from "./api";

export const workoutDetailQueryKey = (id: string) => ["workout", id] as const;

export function useWorkoutDetail(id: string) {
  return useQuery({
    queryKey: workoutDetailQueryKey(id),
    queryFn: () => getWorkoutDetail(id),
  });
}

export function useCreateBlock(workoutId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BlockInput) => {
      const detail = queryClient.getQueryData<WorkoutDetail>(
        workoutDetailQueryKey(workoutId),
      );
      const nextOrderIndex = detail?.blocks.length ?? 0;
      return createBlock(workoutId, nextOrderIndex, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailQueryKey(workoutId),
      });
      queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
    },
  });
}

export function useUpdateBlock(workoutId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      blockId,
      input,
    }: {
      blockId: string;
      input: BlockInput;
    }) => updateBlock(blockId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailQueryKey(workoutId),
      });
      queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
    },
  });
}

export function useDeleteBlock(workoutId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) => deleteBlock(blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailQueryKey(workoutId),
      });
      queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
    },
  });
}

export function useReorderBlocks(workoutId: string) {
  const queryClient = useQueryClient();
  const queryKey = workoutDetailQueryKey(workoutId);

  return useMutation({
    mutationFn: (orderedBlockIds: string[]) =>
      reorderBlocks(workoutId, orderedBlockIds),
    onMutate: async (orderedBlockIds: string[]) => {
      const previous = queryClient.getQueryData<WorkoutDetail>(queryKey);
      if (previous) {
        const blockById = new Map(previous.blocks.map((b) => [b.id, b]));
        const reordered = orderedBlockIds
          .map((id, index) => {
            const block = blockById.get(id);
            return block ? { ...block, orderIndex: index } : null;
          })
          .filter((b): b is NonNullable<typeof b> => b !== null);
        queryClient.setQueryData(queryKey, { ...previous, blocks: reordered });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateWorkoutMeta(workoutId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description: string | null }) =>
      updateWorkoutMeta(workoutId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutDetailQueryKey(workoutId),
      });
      queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
    },
  });
}
