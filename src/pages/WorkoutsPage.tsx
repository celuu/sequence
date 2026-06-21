import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { useWorkouts } from "../features/workouts/hooks";
import { WorkoutTable } from "../features/workouts/WorkoutTable";
import { CreateWorkoutModal } from "../features/workouts/CreateWorkoutModal";
import { LoadingState } from "../components/ui/LoadingState";

export default function WorkoutsPage() {
  const { data: workouts = [], isLoading } = useWorkouts();
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Flex align="center" justify="space-between" mb={6}>
        <Heading size="md">Workouts</Heading>
        <Button colorPalette="brand" onClick={() => setFormOpen(true)}>
          New workout
        </Button>
      </Flex>

      {isLoading ? <LoadingState /> : <WorkoutTable workouts={workouts} />}

      <CreateWorkoutModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={(workout) => navigate(`/workouts/${workout.id}`)}
      />
    </>
  );
}
