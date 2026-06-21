import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, HStack, Heading } from "@chakra-ui/react";
import { useWorkouts } from "../features/workouts/hooks";
import { WorkoutTable } from "../features/workouts/WorkoutTable";
import { CreateWorkoutModal } from "../features/workouts/CreateWorkoutModal";
import { ImportWorkoutModal } from "../features/workout-import/ImportWorkoutModal";
import { LoadingState } from "../components/ui/LoadingState";

export default function WorkoutsPage() {
  const { data: workouts = [], isLoading } = useWorkouts();
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        gap={3}
        mb={6}
      >
        <Heading size="md">Workouts</Heading>
        <HStack flexWrap="wrap">
          <Button
            variant="outline"
            flex={{ base: 1, md: "initial" }}
            onClick={() => setImportOpen(true)}
          >
            Import from text
          </Button>
          <Button
            colorPalette="brand"
            flex={{ base: 1, md: "initial" }}
            onClick={() => setFormOpen(true)}
          >
            New workout
          </Button>
        </HStack>
      </Flex>

      {isLoading ? <LoadingState /> : <WorkoutTable workouts={workouts} />}

      <CreateWorkoutModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={(workout) => navigate(`/workouts/${workout.id}`)}
      />

      <ImportWorkoutModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={(workoutId) => navigate(`/workouts/${workoutId}`)}
      />
    </>
  );
}
