import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { useWorkoutDetail } from "../features/workout-builder/hooks";
import { WorkoutMetaBar } from "../features/workout-builder/WorkoutMetaBar";
import { BlockTable } from "../features/workout-builder/BlockTable";
import { BlockFormDrawer } from "../features/workout-builder/BlockFormDrawer";
import { DuplicateWorkoutButton } from "../features/workouts/DuplicateWorkoutButton";
import { LoadingState } from "../components/ui/LoadingState";
import type { WorkoutBlock } from "../types/domain";

export default function WorkoutBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: workout, isLoading } = useWorkoutDetail(id!);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<WorkoutBlock | null>(null);

  if (isLoading || !workout) {
    return <LoadingState />;
  }

  const openAddDrawer = () => {
    setEditingBlock(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (block: WorkoutBlock) => {
    setEditingBlock(block);
    setDrawerOpen(true);
  };

  return (
    <>
      <Flex justify="flex-end" mb={2}>
        <DuplicateWorkoutButton workoutId={workout.id} />
      </Flex>

      <WorkoutMetaBar workout={workout} />

      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        gap={3}
        mb={4}
      >
        <Heading size="sm">Exercises</Heading>
        <Button colorPalette="brand" onClick={openAddDrawer}>
          Add exercise
        </Button>
      </Flex>

      <BlockTable
        workoutId={workout.id}
        blocks={workout.blocks}
        onEditBlock={openEditDrawer}
      />

      <BlockFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        workoutId={workout.id}
        block={editingBlock}
      />
    </>
  );
}
