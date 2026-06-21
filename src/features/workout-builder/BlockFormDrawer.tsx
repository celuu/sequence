import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  CloseButton,
  Drawer,
  Field,
  NativeSelect,
  NumberInput,
  Portal,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useExercises } from "../exercises/hooks";
import type { BlockSide, Exercise, WorkoutBlock } from "../../types/domain";
import { SpringPicker } from "./SpringPicker";
import { useCreateBlock, useUpdateBlock } from "./hooks";
import type { BlockInput, BlockSpringInput } from "./api";

const blockFormSchema = z.object({
  exerciseId: z.string().min(1, "Select an exercise"),
  side: z.enum(["left", "right", "both", "none"]),
  durationSeconds: z.string().min(1, "Duration is required"),
  notes: z.string(),
});

type BlockFormValues = z.infer<typeof blockFormSchema>;

const emptyValues: BlockFormValues = {
  exerciseId: "",
  side: "none",
  durationSeconds: "30",
  notes: "",
};

function blockToFormValues(block: WorkoutBlock): BlockFormValues {
  return {
    exerciseId: block.exerciseId,
    side: block.side,
    durationSeconds: String(block.durationSeconds),
    notes: block.notes ?? "",
  };
}

interface BlockFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string;
  block?: WorkoutBlock | null;
}

export function BlockFormDrawer({
  open,
  onOpenChange,
  workoutId,
  block,
}: BlockFormDrawerProps) {
  const { data: exercises, isLoading: exercisesLoading } = useExercises();

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      size="md"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            {open && exercisesLoading && (
              <Drawer.Body>
                <Stack align="center" py={16}>
                  <Spinner />
                </Stack>
              </Drawer.Body>
            )}
            {open && !exercisesLoading && (
              <BlockFormBody
                workoutId={workoutId}
                block={block}
                exercises={exercises ?? []}
                onDone={() => onOpenChange(false)}
              />
            )}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

interface BlockFormBodyProps {
  workoutId: string;
  block?: WorkoutBlock | null;
  exercises: Exercise[];
  onDone: () => void;
}

function BlockFormBody({
  workoutId,
  block,
  exercises,
  onDone,
}: BlockFormBodyProps) {
  const isEditing = !!block;
  const createBlock = useCreateBlock(workoutId);
  const updateBlock = useUpdateBlock(workoutId);
  const [springs, setSprings] = useState<BlockSpringInput[]>(() =>
    block?.springs.map((s) => ({
      springTypeId: s.springTypeId,
      count: s.count,
    })) ?? [],
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlockFormValues>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: block ? blockToFormValues(block) : emptyValues,
  });

  const onSubmit = async (values: BlockFormValues) => {
    const input: BlockInput = {
      exerciseId: values.exerciseId,
      side: values.side as BlockSide,
      durationSeconds: Number(values.durationSeconds),
      notes: values.notes.trim() || null,
      springs,
    };

    if (isEditing && block) {
      await updateBlock.mutateAsync({ blockId: block.id, input });
    } else {
      await createBlock.mutateAsync(input);
    }
    onDone();
  };

  return (
    <>
      <Drawer.Header>
        <Drawer.Title>
          {isEditing ? "Edit exercise block" : "Add exercise block"}
        </Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        <Stack
          as="form"
          id="block-form"
          gap={4}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Field.Root invalid={!!errors.exerciseId} required>
            <Field.Label>Exercise</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field {...register("exerciseId")}>
                <option value="">Select an exercise…</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Field.ErrorText>{errors.exerciseId?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root>
            <Field.Label>Side</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field {...register("side")}>
                <option value="none">None</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="both">Both</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          <Field.Root invalid={!!errors.durationSeconds} required>
            <Field.Label>Duration (seconds)</Field.Label>
            <Controller
              control={control}
              name="durationSeconds"
              render={({ field }) => (
                <NumberInput.Root
                  min={1}
                  value={field.value}
                  onValueChange={(details) => field.onChange(details.value)}
                >
                  <NumberInput.Control />
                  <NumberInput.Input onBlur={field.onBlur} />
                </NumberInput.Root>
              )}
            />
            <Field.ErrorText>
              {errors.durationSeconds?.message}
            </Field.ErrorText>
          </Field.Root>

          <Stack gap={1}>
            <Text fontSize="sm" fontWeight="medium">
              Springs
            </Text>
            <SpringPicker value={springs} onChange={setSprings} />
          </Stack>

          <Field.Root>
            <Field.Label>Notes</Field.Label>
            <Textarea {...register("notes")} rows={3} />
          </Field.Root>
        </Stack>
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.ActionTrigger asChild>
          <Button variant="outline">Cancel</Button>
        </Drawer.ActionTrigger>
        <Button
          type="submit"
          form="block-form"
          colorPalette="brand"
          loading={isSubmitting}
        >
          {isEditing ? "Save changes" : "Add block"}
        </Button>
      </Drawer.Footer>
      <Drawer.CloseTrigger asChild>
        <CloseButton size="sm" />
      </Drawer.CloseTrigger>
    </>
  );
}
