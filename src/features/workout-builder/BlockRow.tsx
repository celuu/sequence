import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Badge,
  Box,
  HStack,
  IconButton,
  Menu,
  Portal,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import type { WorkoutBlock } from "../../types/domain";
import { sideLabel } from "./blockLabels";

interface BlockRowProps {
  block: WorkoutBlock;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function BlockRow({
  block,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const springsLabel = block.springs.length
    ? block.springs
        .map((s) => `${s.count} ${s.springType?.name ?? "?"}`)
        .join(" + ")
    : "—";

  return (
    <Table.Row ref={setNodeRef} style={style}>
      <Table.Cell>
        <HStack gap={1}>
          <Box
            {...attributes}
            {...listeners}
            cursor="grab"
            color="gray.400"
            px={1}
            aria-label="Drag to reorder"
          >
            ⠿
          </Box>
          <Stack gap={0}>
            <IconButton
              aria-label="Move up"
              size="2xs"
              variant="ghost"
              onClick={onMoveUp}
              disabled={isFirst}
            >
              ↑
            </IconButton>
            <IconButton
              aria-label="Move down"
              size="2xs"
              variant="ghost"
              onClick={onMoveDown}
              disabled={isLast}
            >
              ↓
            </IconButton>
          </Stack>
        </HStack>
      </Table.Cell>
      <Table.Cell fontWeight={600}>{block.exercise?.name ?? "—"}</Table.Cell>
      <Table.Cell>
        <Badge>{sideLabel[block.side]}</Badge>
      </Table.Cell>
      <Table.Cell>{block.durationSeconds}s</Table.Cell>
      <Table.Cell>{springsLabel}</Table.Cell>
      <Table.Cell>
        {block.notes ? (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Text maxW="160px" truncate>
                {block.notes}
              </Text>
            </Tooltip.Trigger>
            <Portal>
              <Tooltip.Positioner>
                <Tooltip.Content>{block.notes}</Tooltip.Content>
              </Tooltip.Positioner>
            </Portal>
          </Tooltip.Root>
        ) : (
          "—"
        )}
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
      </Table.Cell>
    </Table.Row>
  );
}
