import {
  Badge,
  Box,
  HStack,
  IconButton,
  Menu,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { WorkoutBlock } from "../../types/domain";
import { sideLabel } from "./blockLabels";

interface BlockCardProps {
  block: WorkoutBlock;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function BlockCard({
  block,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockCardProps) {
  const springsLabel = block.springs.length
    ? block.springs
        .map((s) => `${s.count} ${s.springType?.name ?? "?"}`)
        .join(" + ")
    : null;

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <Stack direction="row" justify="space-between" align="flex-start">
        <Stack gap={1} flex={1}>
          <Text fontWeight={600}>{block.exercise?.name ?? "—"}</Text>
          <HStack gap={2} flexWrap="wrap">
            <Badge>{sideLabel[block.side]}</Badge>
            <Text fontSize="sm" color="gray.600">
              {block.durationSeconds}s
            </Text>
            {springsLabel && (
              <Text fontSize="sm" color="gray.600">
                {springsLabel}
              </Text>
            )}
          </HStack>
          {block.notes && (
            <Text fontSize="sm" color="gray.600">
              {block.notes}
            </Text>
          )}
        </Stack>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Text as="button" cursor="pointer" px={2}>
              ⋯
            </Text>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="edit" onClick={onEdit}>
                  Edit
                </Menu.Item>
                <Menu.Item value="delete" color="red.600" onClick={onDelete}>
                  Delete
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Stack>
      <HStack justify="flex-end" mt={2} gap={1}>
        <IconButton
          aria-label="Move up"
          size="xs"
          variant="ghost"
          onClick={onMoveUp}
          disabled={isFirst}
        >
          ↑
        </IconButton>
        <IconButton
          aria-label="Move down"
          size="xs"
          variant="ghost"
          onClick={onMoveDown}
          disabled={isLast}
        >
          ↓
        </IconButton>
      </HStack>
    </Box>
  );
}
