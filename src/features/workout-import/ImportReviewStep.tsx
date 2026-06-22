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
          <Text fontWeight="semibold">
            Ready to import ({readyDrafts.length})
          </Text>

          <Stack gap={3} display={{ base: "flex", md: "none" }}>
            {readyDrafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                bucket="ready"
                existingExercises={existingExercises}
                onUpdate={(patch) => updateDraft(draft.id, patch)}
                onRemove={() => removeDraft(draft.id)}
              />
            ))}
          </Stack>

          <Box overflowX="auto" display={{ base: "none", md: "block" }}>
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

          <Stack gap={3} display={{ base: "flex", md: "none" }}>
            {attentionDrafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                bucket="attention"
                existingExercises={existingExercises}
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

function badgeFor(draft: DraftBlock): { label: string; color: string } {
  if (draft.status === "needs-review") {
    return { label: draft.reviewReason ?? "Missing duration", color: "orange" };
  }
  return { label: "New exercise", color: "blue" };
}

function MatchExistingSelect({
  draft,
  existingExercises,
  onUpdate,
  size = "sm",
}: {
  draft: DraftBlock;
  existingExercises: Exercise[];
  onUpdate: (patch: Partial<DraftBlock>) => void;
  size?: "sm" | "md";
}) {
  return (
    <NativeSelect.Root size={size}>
      <NativeSelect.Field
        value={draft.exerciseId ?? ""}
        onChange={(e) => {
          const exerciseId = e.target.value || null;
          const matched = existingExercises.find((ex) => ex.id === exerciseId);
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
  );
}

function SideSelect({
  draft,
  onUpdate,
  size = "sm",
}: {
  draft: DraftBlock;
  onUpdate: (patch: Partial<DraftBlock>) => void;
  size?: "sm" | "md";
}) {
  return (
    <NativeSelect.Root size={size}>
      <NativeSelect.Field
        value={draft.side}
        onChange={(e) => onUpdate({ side: e.target.value as DraftBlock["side"] })}
      >
        <option value="none">None</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="both">Both</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

function DurationInput({
  draft,
  onUpdate,
  size = "sm",
}: {
  draft: DraftBlock;
  onUpdate: (patch: Partial<DraftBlock>) => void;
  size?: "sm" | "md";
}) {
  return (
    <NumberInput.Root
      size={size}
      min={1}
      value={draft.durationSeconds != null ? String(draft.durationSeconds) : ""}
      onValueChange={(details) =>
        onUpdate({ durationSeconds: details.valueAsNumber || null })
      }
    >
      <NumberInput.Control />
      <NumberInput.Input />
    </NumberInput.Root>
  );
}

function DraftRow({ draft, bucket, existingExercises, onUpdate, onRemove }: DraftRowProps) {
  const badge = badgeFor(draft);

  return (
    <Table.Row>
      {bucket === "attention" && (
        <Table.Cell>
          <Badge colorPalette={badge.color}>{badge.label}</Badge>
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
          <MatchExistingSelect
            draft={draft}
            existingExercises={existingExercises}
            onUpdate={onUpdate}
          />
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
        <SideSelect draft={draft} onUpdate={onUpdate} />
      </Table.Cell>
      <Table.Cell minW="100px">
        <DurationInput draft={draft} onUpdate={onUpdate} />
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

function DraftCard({ draft, bucket, existingExercises, onUpdate, onRemove }: DraftRowProps) {
  const badge = badgeFor(draft);

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <Stack gap={3}>
        <Stack direction="row" justify="space-between" align="flex-start">
          {bucket === "attention" ? (
            <Input
              size="sm"
              flex={1}
              value={draft.exerciseName}
              onChange={(e) => onUpdate({ exerciseName: e.target.value })}
            />
          ) : (
            <Text fontWeight={600}>{draft.exerciseName}</Text>
          )}
          <IconButton
            aria-label="Remove row"
            size="2xs"
            variant="ghost"
            onClick={onRemove}
          >
            ✕
          </IconButton>
        </Stack>

        {bucket === "attention" && (
          <Badge colorPalette={badge.color} alignSelf="flex-start">
            {badge.label}
          </Badge>
        )}

        {bucket === "attention" && (
          <Field.Root>
            <Field.Label fontSize="xs">Match existing</Field.Label>
            <MatchExistingSelect
              draft={draft}
              existingExercises={existingExercises}
              onUpdate={onUpdate}
            />
          </Field.Root>
        )}

        {bucket === "attention" && (
          <Field.Root>
            <Field.Label fontSize="xs">Category</Field.Label>
            <Input
              size="sm"
              value={draft.category ?? ""}
              onChange={(e) => onUpdate({ category: e.target.value || null })}
            />
          </Field.Root>
        )}

        <Stack direction="row" gap={3}>
          <Field.Root flex={1}>
            <Field.Label fontSize="xs">Side</Field.Label>
            <SideSelect draft={draft} onUpdate={onUpdate} />
          </Field.Root>
          <Field.Root flex={1}>
            <Field.Label fontSize="xs">Duration (s)</Field.Label>
            <DurationInput draft={draft} onUpdate={onUpdate} />
          </Field.Root>
        </Stack>

        <Field.Root>
          <Field.Label fontSize="xs">Notes</Field.Label>
          <Input
            size="sm"
            value={draft.notes ?? ""}
            onChange={(e) => onUpdate({ notes: e.target.value || null })}
          />
        </Field.Root>
      </Stack>
    </Box>
  );
}
