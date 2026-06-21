import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { useDuplicateWorkout } from "./hooks";

interface DuplicateWorkoutButtonProps {
  workoutId: string;
}

export function DuplicateWorkoutButton({
  workoutId,
}: DuplicateWorkoutButtonProps) {
  const navigate = useNavigate();
  const duplicateWorkout = useDuplicateWorkout();

  const handleClick = async () => {
    const newId = await duplicateWorkout.mutateAsync(workoutId);
    navigate(`/workouts/${newId}`);
  };

  return (
    <Button
      variant="outline"
      loading={duplicateWorkout.isPending}
      onClick={handleClick}
    >
      Duplicate workout
    </Button>
  );
}
