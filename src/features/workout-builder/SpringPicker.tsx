import { Box, HStack, NumberInput, Stack, Text } from "@chakra-ui/react";
import { useSpringTypes } from "../springs/hooks";
import type { BlockSpringInput } from "./api";

interface SpringPickerProps {
  value: BlockSpringInput[];
  onChange: (springs: BlockSpringInput[]) => void;
}

export function SpringPicker({ value, onChange }: SpringPickerProps) {
  const { data: springTypes = [] } = useSpringTypes();

  const countFor = (springTypeId: string) =>
    value.find((s) => s.springTypeId === springTypeId)?.count ?? 0;

  const setCount = (springTypeId: string, count: number) => {
    const next = value.filter((s) => s.springTypeId !== springTypeId);
    if (count > 0) next.push({ springTypeId, count });
    onChange(next);
  };

  if (springTypes.length === 0) {
    return (
      <Text fontSize="sm" color="gray.500">
        No spring types yet — add some under Spring settings.
      </Text>
    );
  }

  return (
    <Stack gap={2}>
      {springTypes.map((springType) => (
        <HStack key={springType.id} justify="space-between">
          <HStack>
            <Box
              boxSize="3"
              borderRadius="full"
              bg={springType.colorHex ?? "gray.300"}
              borderWidth="1px"
            />
            <Text>{springType.name}</Text>
          </HStack>
          <NumberInput.Root
            min={0}
            value={String(countFor(springType.id))}
            onValueChange={(details) =>
              setCount(springType.id, details.valueAsNumber || 0)
            }
            maxW="100px"
          >
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
        </HStack>
      ))}
    </Stack>
  );
}
