import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  NativeSelect,
  NumberInput,
  Portal,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import type { Difficulty, Exercise } from "../../types/domain";
import { useCreateExercise, useUpdateExercise } from "./hooks";
import type { ExerciseInput } from "./api";

const exerciseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string(),
  muscleGroups: z.string(),
  difficulty: z.enum(["", "beginner", "intermediate", "advanced"]),
  defaultDurationSeconds: z.string(),
  notes: z.string(),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

const emptyValues: ExerciseFormValues = {
  name: "",
  category: "",
  muscleGroups: "",
  difficulty: "",
  defaultDurationSeconds: "",
  notes: "",
};

function exerciseToFormValues(exercise: Exercise): ExerciseFormValues {
  return {
    name: exercise.name,
    category: exercise.category ?? "",
    muscleGroups: exercise.muscleGroups?.join(", ") ?? "",
    difficulty: exercise.difficulty ?? "",
    defaultDurationSeconds:
      exercise.defaultDurationSeconds != null
        ? String(exercise.defaultDurationSeconds)
        : "",
    notes: exercise.notes ?? "",
  };
}

interface ExerciseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: Exercise | null;
}

export function ExerciseFormModal({
  open,
  onOpenChange,
  exercise,
}: ExerciseFormModalProps) {
  const isEditing = !!exercise;
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(exercise ? exerciseToFormValues(exercise) : emptyValues);
    }
  }, [open, exercise, reset]);

  const onSubmit = async (values: ExerciseFormValues) => {
    const input: ExerciseInput = {
      name: values.name.trim(),
      category: values.category.trim() || null,
      muscleGroups: values.muscleGroups
        ? values.muscleGroups
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null,
      difficulty: (values.difficulty || null) as Difficulty | null,
      defaultDurationSeconds: values.defaultDurationSeconds
        ? Number(values.defaultDurationSeconds)
        : null,
      notes: values.notes.trim() || null,
    };

    if (isEditing && exercise) {
      await updateExercise.mutateAsync({ id: exercise.id, input });
    } else {
      await createExercise.mutateAsync(input);
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {isEditing ? "Edit exercise" : "New exercise"}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack as="form" id="exercise-form" gap={4} onSubmit={handleSubmit(onSubmit)}>
                <Field.Root invalid={!!errors.name} required>
                  <Field.Label>Name</Field.Label>
                  <Input {...register("name")} autoFocus />
                  <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Category</Field.Label>
                  <Input {...register("category")} placeholder="e.g. Lower body" />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Muscle groups</Field.Label>
                  <Input
                    {...register("muscleGroups")}
                    placeholder="Comma separated, e.g. Glutes, Quads"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Difficulty</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field {...register("difficulty")}>
                      <option value="">—</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Default duration (seconds)</Field.Label>
                  <Controller
                    control={control}
                    name="defaultDurationSeconds"
                    render={({ field }) => (
                      <NumberInput.Root
                        min={0}
                        value={field.value}
                        onValueChange={(details) => field.onChange(details.value)}
                      >
                        <NumberInput.Control />
                        <NumberInput.Input onBlur={field.onBlur} />
                      </NumberInput.Root>
                    )}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Notes</Field.Label>
                  <Textarea {...register("notes")} rows={3} />
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                type="submit"
                form="exercise-form"
                colorPalette="brand"
                loading={isSubmitting}
              >
                {isEditing ? "Save changes" : "Create exercise"}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
