import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Input,
  Portal,
  Stack,
} from "@chakra-ui/react";
import type { SpringType } from "../../types/domain";
import { useCreateSpringType, useUpdateSpringType } from "./hooks";
import type { SpringTypeInput } from "./api";

const springTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  colorHex: z.string(),
});

type SpringTypeFormValues = z.infer<typeof springTypeFormSchema>;

const emptyValues: SpringTypeFormValues = { name: "", colorHex: "#a0aec0" };

function springTypeToFormValues(spring: SpringType): SpringTypeFormValues {
  return { name: spring.name, colorHex: spring.colorHex ?? "#a0aec0" };
}

interface SpringTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  springType?: SpringType | null;
}

export function SpringTypeFormModal({
  open,
  onOpenChange,
  springType,
}: SpringTypeFormModalProps) {
  const isEditing = !!springType;
  const createSpringType = useCreateSpringType();
  const updateSpringType = useUpdateSpringType();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpringTypeFormValues>({
    resolver: zodResolver(springTypeFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(springType ? springTypeToFormValues(springType) : emptyValues);
    }
  }, [open, springType, reset]);

  const onSubmit = async (values: SpringTypeFormValues) => {
    const input: SpringTypeInput = {
      name: values.name.trim(),
      colorHex: values.colorHex || null,
    };

    if (isEditing && springType) {
      await updateSpringType.mutateAsync({ id: springType.id, input });
    } else {
      await createSpringType.mutateAsync(input);
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
                {isEditing ? "Edit spring type" : "New spring type"}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack
                as="form"
                id="spring-type-form"
                gap={4}
                onSubmit={handleSubmit(onSubmit)}
              >
                <Field.Root invalid={!!errors.name} required>
                  <Field.Label>Name</Field.Label>
                  <Input {...register("name")} autoFocus />
                  <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Color</Field.Label>
                  <HStack>
                    <Input
                      type="color"
                      {...register("colorHex")}
                      w="60px"
                      p={1}
                    />
                  </HStack>
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                type="submit"
                form="spring-type-form"
                colorPalette="brand"
                loading={isSubmitting}
              >
                {isEditing ? "Save changes" : "Create spring type"}
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
