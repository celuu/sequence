import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Menu, Portal, Stack, Table, Text } from "@chakra-ui/react";
import type { Workout } from "../../types/domain";
import { ConfirmDeleteDialog } from "../../components/ui/ConfirmDeleteDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { useDeleteWorkout, useDuplicateWorkout } from "./hooks";

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface WorkoutTableProps {
  workouts: Workout[];
}

export function WorkoutTable({ workouts }: WorkoutTableProps) {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);
  const deleteWorkout = useDeleteWorkout();
  const duplicateWorkout = useDuplicateWorkout();

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteWorkout.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleDuplicate = async (workoutId: string) => {
    const newId = await duplicateWorkout.mutateAsync(workoutId);
    navigate(`/workouts/${newId}`);
  };

  if (workouts.length === 0) {
    return (
      <EmptyState
        title="No workouts yet"
        description="Create your first workout to start building a class."
      />
    );
  }

  const renderMenu = (workout: Workout) => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Text as="button" cursor="pointer" px={2}>
          ⋯
        </Text>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item
              value="open"
              onClick={() => navigate(`/workouts/${workout.id}`)}
            >
              Open
            </Menu.Item>
            <Menu.Item
              value="duplicate"
              onClick={() => handleDuplicate(workout.id)}
            >
              Duplicate
            </Menu.Item>
            <Menu.Item
              value="delete"
              color="red.600"
              onClick={() => setDeleteTarget(workout)}
            >
              Delete
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );

  return (
    <>
      <Stack gap={3} display={{ base: "flex", md: "none" }}>
        {workouts.map((workout) => (
          <Box
            key={workout.id}
            borderWidth="1px"
            borderRadius="md"
            p={4}
            cursor="pointer"
            onClick={() => navigate(`/workouts/${workout.id}`)}
          >
            <Stack direction="row" justify="space-between" align="flex-start">
              <Stack gap={1}>
                <Text fontWeight={600}>{workout.name}</Text>
                {workout.description && (
                  <Text fontSize="sm" color="gray.600">
                    {workout.description}
                  </Text>
                )}
                <Text fontSize="sm" color="gray.600">
                  {workout.totalDurationSeconds
                    ? `${Math.round(workout.totalDurationSeconds / 60)} min`
                    : "—"}
                  {" · "}
                  {formatUpdatedAt(workout.updatedAt)}
                </Text>
              </Stack>
              <Box onClick={(e) => e.stopPropagation()}>
                {renderMenu(workout)}
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Table.Root size="sm" interactive display={{ base: "none", md: "table" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
            <Table.ColumnHeader>Total duration</Table.ColumnHeader>
            <Table.ColumnHeader>Updated</Table.ColumnHeader>
            <Table.ColumnHeader />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {workouts.map((workout) => (
            <Table.Row
              key={workout.id}
              cursor="pointer"
              onClick={() => navigate(`/workouts/${workout.id}`)}
            >
              <Table.Cell fontWeight={600}>{workout.name}</Table.Cell>
              <Table.Cell>{workout.description ?? "—"}</Table.Cell>
              <Table.Cell>
                {workout.totalDurationSeconds
                  ? `${Math.round(workout.totalDurationSeconds / 60)} min`
                  : "—"}
              </Table.Cell>
              <Table.Cell>{formatUpdatedAt(workout.updatedAt)}</Table.Cell>
              <Table.Cell textAlign="end" onClick={(e) => e.stopPropagation()}>
                {renderMenu(workout)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete workout"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        isLoading={deleteWorkout.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
