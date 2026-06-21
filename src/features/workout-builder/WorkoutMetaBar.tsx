import { useMemo } from "react";
import { Badge, Editable, HStack, Stack, Text } from "@chakra-ui/react";
import type { WorkoutDetail } from "../../types/domain";
import { useUpdateWorkoutMeta } from "./hooks";

interface WorkoutMetaBarProps {
  workout: WorkoutDetail;
}

export function WorkoutMetaBar({ workout }: WorkoutMetaBarProps) {
  const updateMeta = useUpdateWorkoutMeta(workout.id);

  const totalMinutes = useMemo(() => {
    const totalSeconds = workout.blocks.reduce(
      (sum, b) => sum + b.durationSeconds,
      0,
    );
    return Math.round(totalSeconds / 60);
  }, [workout.blocks]);

  const commitName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === workout.name) return;
    updateMeta.mutate({ name: trimmed, description: workout.description });
  };

  const commitDescription = (description: string) => {
    const trimmed = description.trim() || null;
    if (trimmed === workout.description) return;
    updateMeta.mutate({ name: workout.name, description: trimmed });
  };

  return (
    <Stack gap={2} mb={6}>
      <HStack justify="space-between">
        <Editable.Root
          key={workout.name}
          defaultValue={workout.name}
          onValueCommit={(details) => commitName(details.value)}
          fontSize="xl"
          fontWeight={700}
        >
          <Editable.Preview />
          <Editable.Input />
        </Editable.Root>
        <HStack>
          {updateMeta.isPending && (
            <Text fontSize="sm" color="gray.500">
              Saving…
            </Text>
          )}
          {!updateMeta.isPending && updateMeta.isSuccess && (
            <Text fontSize="sm" color="gray.500">
              Saved
            </Text>
          )}
          <Badge>{totalMinutes} min total</Badge>
        </HStack>
      </HStack>
      <Editable.Root
        key={workout.description ?? ""}
        defaultValue={workout.description ?? ""}
        placeholder="Add a description…"
        onValueCommit={(details) => commitDescription(details.value)}
        color="gray.600"
      >
        <Editable.Preview />
        <Editable.Textarea />
      </Editable.Root>
    </Stack>
  );
}
