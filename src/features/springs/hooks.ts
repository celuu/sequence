import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";
import type { SpringType } from "../../types/domain";
import {
  createSpringType,
  deleteSpringType,
  listSpringTypes,
  updateSpringType,
  type SpringTypeInput,
} from "./api";

export const springTypesQueryKey = ["spring-types"] as const;

export function useSpringTypes() {
  return useQuery({
    queryKey: springTypesQueryKey,
    queryFn: listSpringTypes,
  });
}

export function useCreateSpringType() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: SpringTypeInput) => {
      const existing =
        queryClient.getQueryData<SpringType[]>(springTypesQueryKey) ?? [];
      const nextSortOrder = existing.length
        ? Math.max(...existing.map((s) => s.sortOrder)) + 1
        : 0;
      return createSpringType(user!.id, input, nextSortOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: springTypesQueryKey });
    },
  });
}

export function useUpdateSpringType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SpringTypeInput }) =>
      updateSpringType(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: springTypesQueryKey });
    },
  });
}

export function useDeleteSpringType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSpringType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: springTypesQueryKey });
    },
  });
}
