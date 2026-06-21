import {
  Badge,
  Box,
  Field,
  IconButton,
  Input,
  NativeSelect,
  NumberInput,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import type { Exercise } from "../../types/domain";
import type { DraftBlock } from "./types";

function recomputeStatus(draft: DraftBlock): DraftBlock["status"] {
  if (draft.durationSeconds == null || draft.durationSeconds <= 0) {
    return "needs-review";
  }
  return draft.exerciseId ? "ready" : "new";
}

interface ImportReviewStepProps {
  workoutName: string;
  onWorkoutNameChange: (name: string) => void;
  draftBlocks: DraftBlock[];
  onChange: (draftBlocks: DraftBlock[]) => void;
  existingExercises: Exercise[];
}

export function ImportReviewStep({
  workoutName,
  onWorkoutNameChange,
  draftBlocks,
  onChange,
  existingExercises,
}: ImportReviewStepProps) {
  const updateDraft = (id: string, patch: Partial<DraftBlock>) => {
    onChange(
      draftBlocks.map((draft) => {
        if (draft.id !== id) return draft;
        const next = { ...draft, ...patch };
        return { ...next, status: recomputeStatus(next) };
      }),
    );
  };

  const removeDraft = (id: string) => {
    onChange(draftBlocks.filter((draft) => draft.id !== id));
  };

  const readyDrafts = draftBlocks.filter((d) => d.status === "ready");
  const attentionDrafts = draftBlocks.filter(
    (d) => d.status === "new" || d.status === "needs-review",
  );

  return (
    <Stack gap={6}>
      <Field.Root required>
        <Field.Label>Workout name</Field.Label>
        <Input
          value={workoutName}
          onChange={(e) => onWorkoutNameChange(e.target.value)}
          autoFocus
        />
      </Field.Root>

      <Text fontSize="sm" color="gray.500">
        Rows without a duration won't be imported until you set one.
      </Text>

      {readyDrafts.length > 0 && (
        <Stack gap={2}>
          <Text fontWeight="semibold">Ready to import ({readyDrafts.length})</Text>
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Exercise</Table.ColumnHeader>
                  <Table.ColumnHeader>Side</Table.ColumnHeader>
                  <Table.ColumnHeader>Duration (s)</Table.ColumnHeader>
                  <Table.ColumnHeader>Notes</Table.ColumnHeader>
                  <Table.ColumnHeader />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {readyDrafts.map((draft) => (
                  <DraftRow
                    key={draft.id}
                    draft={draft}
                    bucket="ready"
                    existingExercises={existingExercises}
                    onUpdate={(patch) => updateDraft(draft.id, patch)}
                    onRemove={() => removeDraft(draft.id)}
                  />
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Stack>
      )}

      {attentionDrafts.length > 0 && (
        <Stack gap={2}>
          <Text fontWeight="semibold">
            Needs your attention ({attentionDrafts.length})
          </Text>
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader />
                  <Table.ColumnHeader>Exercise</Table.ColumnHeader>
                  <Table.ColumnHeader>Match existing</Table.ColumnHeader>
                  <Table.ColumnHeader>Category</Table.ColumnHeader>
                  <Table.ColumnHeader>Side</Table.ColumnHeader>
                  <Table.ColumnHeader>Duration (s)</Table.ColumnHeader>
                  <Table.ColumnHeader>Notes</Table.ColumnHeader>
                  <Table.ColumnHeader />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {attentionDrafts.map((draft) => (
                  <DraftRow
                    key={draft.id}
                    draft={draft}
                    bucket="attention"
                    existingExercises={existingExercises}
                    onUpdate={(patch) => updateDraft(draft.id, patch)}
                    onRemove={() => removeDraft(draft.id)}
                  />
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Stack>
      )}

      {draftBlocks.length === 0 && (
        <Text color="gray.500">
          Nothing left to import — go back and paste your class notes again.
        </Text>
      )}
    </Stack>
  );
}

interface DraftRowProps {
  draft: DraftBlock;
  bucket: "ready" | "attention";
  existingExercises: Exercise[];
  onUpdate: (patch: Partial<DraftBlock>) => void;
  onRemove: () => void;
}

function DraftRow({
  draft,
  bucket,
  existingExercises,
  onUpdate,
  onRemove,
}: DraftRowProps) {
  const badgeLabel =
    draft.status === "needs-review"
      ? draft.reviewReason ?? "Missing duration"
      : "New exercise";

  return (
    <Table.Row>
      {bucket === "attention" && (
        <Table.Cell>
          <Badge colorPalette={draft.status === "needs-review" ? "orange" : "blue"}>
            {badgeLabel}
          </Badge>
        </Table.Cell>
      )}
      <Table.Cell minW="160px">
        {bucket === "attention" ? (
          <Input
            size="sm"
            value={draft.exerciseName}
            onChange={(e) => onUpdate({ exerciseName: e.target.value })}
          />
        ) : (
          <Text fontWeight={500}>{draft.exerciseName}</Text>
        )}
      </Table.Cell>
      {bucket === "attention" && (
        <Table.Cell minW="180px">
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={draft.exerciseId ?? ""}
              onChange={(e) => {
                const exerciseId = e.target.value || null;
                const matched = existingExercises.find(
                  (ex) => ex.id === exerciseId,
                );
                onUpdate({
                  exerciseId,
                  exerciseName: matched?.name ?? draft.exerciseName,
                });
              }}
            >
              <option value="">New exercise</option>
              {existingExercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Table.Cell>
      )}
      {bucket === "attention" && (
        <Table.Cell minW="140px">
          <Input
            size="sm"
            value={draft.category ?? ""}
            onChange={(e) => onUpdate({ category: e.target.value || null })}
          />
        </Table.Cell>
      )}
      <Table.Cell minW="110px">
        <NativeSelect.Root size="sm">
          <NativeSelect.Field
            value={draft.side}
            onChange={(e) =>
              onUpdate({ side: e.target.value as DraftBlock["side"] })
            }
          >
            <option value="none">None</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="both">Both</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Table.Cell>
      <Table.Cell minW="100px">
        <NumberInput.Root
          size="sm"
          min={1}
          value={draft.durationSeconds != null ? String(draft.durationSeconds) : ""}
          onValueChange={(details) =>
            onUpdate({ durationSeconds: details.valueAsNumber || null })
          }
        >
          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
      </Table.Cell>
      <Table.Cell minW="140px">
        <Input
          size="sm"
          value={draft.notes ?? ""}
          onChange={(e) => onUpdate({ notes: e.target.value || null })}
        />
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
