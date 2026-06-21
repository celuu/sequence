import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Stack, Table } from "@chakra-ui/react";
import type { WorkoutBlock } from "../../types/domain";
import { ConfirmDeleteDialog } from "../../components/ui/ConfirmDeleteDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { BlockCard } from "./BlockCard";
import { BlockRow } from "./BlockRow";
import { useDeleteBlock, useReorderBlocks } from "./hooks";

interface BlockTableProps {
  workoutId: string;
  blocks: WorkoutBlock[];
  onEditBlock: (block: WorkoutBlock) => void;
}

export function BlockTable({
  workoutId,
  blocks,
  onEditBlock,
}: BlockTableProps) {
  const reorderBlocks = useReorderBlocks(workoutId);
  const deleteBlock = useDeleteBlock(workoutId);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutBlock | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blocks.length) return;
    const reordered = arrayMove(blocks, fromIndex, toIndex);
    reorderBlocks.mutate(reordered.map((b) => b.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = blocks.findIndex((b) => b.id === active.id);
    const toIndex = blocks.findIndex((b) => b.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    moveBlock(fromIndex, toIndex);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlock.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (blocks.length === 0) {
    return (
      <EmptyState
        title="No exercises in this workout yet"
        description="Add your first exercise block to start building this class."
      />
    );
  }

  return (
    <>
      <Stack gap={3} display={{ base: "flex", md: "none" }}>
        {blocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            onEdit={() => onEditBlock(block)}
            onDelete={() => setDeleteTarget(block)}
            onMoveUp={() => moveBlock(index, index - 1)}
            onMoveDown={() => moveBlock(index, index + 1)}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
          />
        ))}
      </Stack>

      <Box display={{ base: "none", md: "block" }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Order</Table.ColumnHeader>
                  <Table.ColumnHeader>Exercise</Table.ColumnHeader>
                  <Table.ColumnHeader>Side</Table.ColumnHeader>
                  <Table.ColumnHeader>Duration</Table.ColumnHeader>
                  <Table.ColumnHeader>Springs</Table.ColumnHeader>
                  <Table.ColumnHeader>Notes</Table.ColumnHeader>
                  <Table.ColumnHeader />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {blocks.map((block, index) => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    onEdit={() => onEditBlock(block)}
                    onDelete={() => setDeleteTarget(block)}
                    onMoveUp={() => moveBlock(index, index - 1)}
                    onMoveDown={() => moveBlock(index, index + 1)}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                  />
                ))}
              </Table.Body>
            </Table.Root>
          </SortableContext>
        </DndContext>
      </Box>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete exercise block"
        description="Delete this exercise from the workout? This can't be undone."
        isLoading={deleteBlock.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
