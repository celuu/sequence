import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import type { Workout } from "../../types/domain";
import { useCreateWorkout } from "./hooks";

const workoutFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

const emptyValues: WorkoutFormValues = { name: "", description: "" };

interface CreateWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (workout: Workout) => void;
}

export function CreateWorkoutModal({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkoutModalProps) {
  const createWorkout = useCreateWorkout();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(emptyValues);
  }, [open, reset]);

  const onSubmit = async (values: WorkoutFormValues) => {
    const workout = await createWorkout.mutateAsync({
      name: values.name.trim(),
      description: values.description.trim() || null,
    });
    onOpenChange(false);
    onCreated(workout);
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
              <Dialog.Title>New workout</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack
                as="form"
                id="create-workout-form"
                gap={4}
                onSubmit={handleSubmit(onSubmit)}
              >
                <Field.Root invalid={!!errors.name} required>
                  <Field.Label>Name</Field.Label>
                  <Input {...register("name")} autoFocus />
                  <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Textarea {...register("description")} rows={3} />
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                type="submit"
                form="create-workout-form"
                colorPalette="brand"
                loading={isSubmitting}
              >
                Create workout
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
