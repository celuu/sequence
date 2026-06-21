import { useState } from "react";
import {
  Alert,
  Badge,
  Menu,
  Portal,
  Table,
  Text,
} from "@chakra-ui/react";
import type { Exercise } from "../../types/domain";
import { ConfirmDeleteDialog } from "../../components/ui/ConfirmDeleteDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ExerciseInUseError } from "./api";
import { useDeleteExercise } from "./hooks";

const difficultyColor: Record<string, string> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
};

interface ExerciseTableProps {
  exercises: Exercise[];
  onEdit: (exercise: Exercise) => void;
}

export function ExerciseTable({ exercises, onEdit }: ExerciseTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteExercise = useDeleteExercise();

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteExercise.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      if (error instanceof ExerciseInUseError) {
        setDeleteError(error.message);
      } else {
        setDeleteError("Something went wrong deleting this exercise.");
      }
    }
  };

  if (exercises.length === 0) {
    return (
      <EmptyState
        title="No exercises yet"
        description="Create your first exercise to start building workouts."
      />
    );
  }

  return (
    <>
      {deleteError && (
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Title>{deleteError}</Alert.Title>
        </Alert.Root>
      )}
      <Table.Root size="sm" interactive>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Category</Table.ColumnHeader>
            <Table.ColumnHeader>Muscle groups</Table.ColumnHeader>
            <Table.ColumnHeader>Difficulty</Table.ColumnHeader>
            <Table.ColumnHeader>Default duration</Table.ColumnHeader>
            <Table.ColumnHeader />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {exercises.map((exercise) => (
            <Table.Row key={exercise.id}>
              <Table.Cell fontWeight={600}>{exercise.name}</Table.Cell>
              <Table.Cell>{exercise.category ?? "—"}</Table.Cell>
              <Table.Cell>
                {exercise.muscleGroups?.length
                  ? exercise.muscleGroups.join(", ")
                  : "—"}
              </Table.Cell>
              <Table.Cell>
                {exercise.difficulty ? (
                  <Badge colorPalette={difficultyColor[exercise.difficulty]}>
                    {exercise.difficulty}
                  </Badge>
                ) : (
                  "—"
                )}
              </Table.Cell>
              <Table.Cell>
                {exercise.defaultDurationSeconds
                  ? `${exercise.defaultDurationSeconds}s`
                  : "—"}
              </Table.Cell>
              <Table.Cell textAlign="end">
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
                          value="edit"
                          onClick={() => onEdit(exercise)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          value="delete"
                          color="red.600"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(exercise);
                          }}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete exercise"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        isLoading={deleteExercise.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
