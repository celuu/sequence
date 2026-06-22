import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  IconButton,
  Input,
  NativeSelect,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import type { Difficulty } from "../../types/domain";
import type { DraftExercise } from "./types";

interface ImportExercisesReviewStepProps {
  draftExercises: DraftExercise[];
  onChange: (draftExercises: DraftExercise[]) => void;
}

export function ImportExercisesReviewStep({
  draftExercises,
  onChange,
}: ImportExercisesReviewStepProps) {
  const [showDuplicates, setShowDuplicates] = useState(false);

  const updateDraft = (id: string, patch: Partial<DraftExercise>) => {
    onChange(
      draftExercises.map((draft) =>
        draft.id === id ? { ...draft, ...patch } : draft,
      ),
    );
  };

  const removeDraft = (id: string) => {
    onChange(draftExercises.filter((draft) => draft.id !== id));
  };

  const toCreate = draftExercises.filter((d) => d.status === "create");
  const duplicates = draftExercises.filter((d) => d.status === "duplicate");

  return (
    <Stack gap={6}>
      <Text fontSize="sm" color="gray.500">
        Review the exercises below before adding them to your library — edit
        any field, or remove a row you don't want.
      </Text>

      <Stack gap={2}>
        <Text fontWeight="semibold">New exercises to create ({toCreate.length})</Text>

        <Stack gap={3} display={{ base: "flex", md: "none" }}>
          {toCreate.map((draft) => (
            <ExerciseCard
              key={draft.id}
              draft={draft}
              onUpdate={(patch) => updateDraft(draft.id, patch)}
              onRemove={() => removeDraft(draft.id)}
            />
          ))}
        </Stack>

        <Box overflowX="auto" display={{ base: "none", md: "block" }}>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader />
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Muscle groups</Table.ColumnHeader>
                <Table.ColumnHeader>Category</Table.ColumnHeader>
                <Table.ColumnHeader>Difficulty</Table.ColumnHeader>
                <Table.ColumnHeader>Notes</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {toCreate.map((draft) => (
                <ExerciseRow
                  key={draft.id}
                  draft={draft}
                  onUpdate={(patch) => updateDraft(draft.id, patch)}
                  onRemove={() => removeDraft(draft.id)}
                />
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        {toCreate.length === 0 && (
          <Text color="gray.500">
            Nothing left to create — go back and paste your list again.
          </Text>
        )}
      </Stack>

      {duplicates.length > 0 && (
        <Stack gap={2}>
          <Button
            variant="ghost"
            size="sm"
            alignSelf="flex-start"
            onClick={() => setShowDuplicates((v) => !v)}
          >
            {showDuplicates ? "Hide" : "Show"} already in your library (
            {duplicates.length})
          </Button>
          {showDuplicates && (
            <Stack gap={2}>
              {duplicates.map((draft) => (
                <Stack
                  key={draft.id}
                  direction="row"
                  justify="space-between"
                  align="center"
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                >
                  <Text fontSize="sm">
                    <Text as="span" fontWeight={600}>
                      {draft.name}
                    </Text>{" "}
                    <Text as="span" color="gray.500">
                      — matches {draft.matchedExistingName}, skipped
                    </Text>
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => updateDraft(draft.id, { status: "create" })}
                  >
                    Add anyway
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}

interface ExerciseFieldsProps {
  draft: DraftExercise;
  onUpdate: (patch: Partial<DraftExercise>) => void;
  size?: "sm" | "md";
}

function NameField({ draft, onUpdate }: ExerciseFieldsProps) {
  return (
    <Input
      size="sm"
      value={draft.name}
      onChange={(e) => onUpdate({ name: e.target.value })}
    />
  );
}

function MuscleGroupsField({ draft, onUpdate }: ExerciseFieldsProps) {
  return (
    <Input
      size="sm"
      value={draft.muscleGroups?.join(", ") ?? ""}
      placeholder="e.g. Core, Legs"
      onChange={(e) => {
        const value = e.target.value;
        const groups = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        onUpdate({ muscleGroups: groups.length > 0 ? groups : null });
      }}
    />
  );
}

function CategoryField({ draft, onUpdate }: ExerciseFieldsProps) {
  return (
    <Input
      size="sm"
      value={draft.category ?? ""}
      onChange={(e) => onUpdate({ category: e.target.value || null })}
    />
  );
}

function DifficultySelect({ draft, onUpdate }: ExerciseFieldsProps) {
  return (
    <NativeSelect.Root size="sm">
      <NativeSelect.Field
        value={draft.difficulty ?? ""}
        onChange={(e) =>
          onUpdate({ difficulty: (e.target.value || null) as Difficulty | null })
        }
      >
        <option value="">—</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

function NotesField({ draft, onUpdate }: ExerciseFieldsProps) {
  return (
    <Input
      size="sm"
      value={draft.notes ?? ""}
      onChange={(e) => onUpdate({ notes: e.target.value || null })}
    />
  );
}

interface RowProps {
  draft: DraftExercise;
  onUpdate: (patch: Partial<DraftExercise>) => void;
  onRemove: () => void;
}

function ExerciseRow({ draft, onUpdate, onRemove }: RowProps) {
  return (
    <Table.Row>
      <Table.Cell>
        {draft.needsReview && (
          <Badge colorPalette="orange">
            {draft.reviewReason ?? "Needs review"}
          </Badge>
        )}
      </Table.Cell>
      <Table.Cell minW="180px">
        <NameField draft={draft} onUpdate={onUpdate} />
      </Table.Cell>
      <Table.Cell minW="160px">
        <MuscleGroupsField draft={draft} onUpdate={onUpdate} />
      </Table.Cell>
      <Table.Cell minW="140px">
        <CategoryField draft={draft} onUpdate={onUpdate} />
      </Table.Cell>
      <Table.Cell minW="140px">
        <DifficultySelect draft={draft} onUpdate={onUpdate} />
      </Table.Cell>
      <Table.Cell minW="200px">
        <NotesField draft={draft} onUpdate={onUpdate} />
      </Table.Cell>
      <Table.Cell>
        <IconButton
          aria-label="Remove row"
          size="2xs"
          variant="ghost"
          onClick={onRemove}
        >
          ✕
        </IconButton>
      </Table.Cell>
    </Table.Row>
  );
}

function ExerciseCard({ draft, onUpdate, onRemove }: RowProps) {
  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <Stack gap={3}>
        <Stack direction="row" justify="space-between" align="flex-start">
          <Box flex={1}>
            <NameField draft={draft} onUpdate={onUpdate} />
          </Box>
          <IconButton
            aria-label="Remove row"
            size="2xs"
            variant="ghost"
            onClick={onRemove}
          >
            ✕
          </IconButton>
        </Stack>
        {draft.needsReview && (
          <Badge colorPalette="orange" alignSelf="flex-start">
            {draft.reviewReason ?? "Needs review"}
          </Badge>
        )}
        <Stack direction="row" gap={3}>
          <Box flex={1}>
            <Text fontSize="xs" color="gray.500" mb={1}>
              Muscle groups
            </Text>
            <MuscleGroupsField draft={draft} onUpdate={onUpdate} />
          </Box>
          <Box flex={1}>
            <Text fontSize="xs" color="gray.500" mb={1}>
              Category
            </Text>
            <CategoryField draft={draft} onUpdate={onUpdate} />
          </Box>
        </Stack>
        <Stack direction="row" gap={3}>
          <Box flex={1}>
            <Text fontSize="xs" color="gray.500" mb={1}>
              Difficulty
            </Text>
            <DifficultySelect draft={draft} onUpdate={onUpdate} />
          </Box>
        </Stack>
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>
            Notes
          </Text>
          <NotesField draft={draft} onUpdate={onUpdate} />
        </Box>
      </Stack>
    </Box>
  );
}
