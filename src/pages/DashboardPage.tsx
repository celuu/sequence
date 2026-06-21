import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Heading, Stack } from "@chakra-ui/react";
import { useWorkouts } from "../features/workouts/hooks";
import { WorkoutTable } from "../features/workouts/WorkoutTable";
import { CreateWorkoutModal } from "../features/workouts/CreateWorkoutModal";
import { LoadingState } from "../components/ui/LoadingState";

const SECTION_LIMIT = 5;

export default function DashboardPage() {
  const { data: workouts = [], isLoading } = useWorkouts();
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  const recentlyEdited = useMemo(
    () => workouts.slice(0, SECTION_LIMIT),
    [workouts],
  );

  const recentlyCreated = useMemo(
    () =>
      [...workouts]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, SECTION_LIMIT),
    [workouts],
  );

  return (
    <>
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        gap={3}
        mb={6}
      >
        <Heading size="md">Dashboard</Heading>
        <Button colorPalette="brand" onClick={() => setFormOpen(true)}>
          Create workout
        </Button>
      </Flex>

      {isLoading ? (
        <LoadingState />
      ) : (
        <Stack gap={8}>
          <Stack gap={3}>
            <Heading size="sm">Recently edited</Heading>
            <WorkoutTable workouts={recentlyEdited} />
          </Stack>
          <Stack gap={3}>
            <Heading size="sm">Recent workouts</Heading>
            <WorkoutTable workouts={recentlyCreated} />
          </Stack>
        </Stack>
      )}

      <CreateWorkoutModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={(workout) => navigate(`/workouts/${workout.id}`)}
      />
    </>
  );
}
