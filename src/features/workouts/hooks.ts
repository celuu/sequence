import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import {
  createWorkout,
  deleteWorkout,
  duplicateWorkout,
  listWorkouts,
  type WorkoutInput,
} from "./api";

export const workoutsQueryKey = ["workouts"] as const;

export function useWorkouts() {
  return useQuery({
    queryKey: workoutsQueryKey,
    queryFn: listWorkouts,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: WorkoutInput) => createWorkout(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
    },
  });
}

export function useDuplicateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workoutId: string) => duplicateWorkout(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutsQueryKey });
    },
  });
}
