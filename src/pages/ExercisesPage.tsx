import { useMemo, useState } from "react";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useExercises } from "../features/exercises/hooks";
import { ExerciseFilters } from "../features/exercises/ExerciseFilters";
import { ExerciseTable } from "../features/exercises/ExerciseTable";
import { ExerciseFormModal } from "../features/exercises/ExerciseFormModal";
import { LoadingState } from "../components/ui/LoadingState";
import type { Exercise } from "../types/domain";

export default function ExercisesPage() {
  const { data: exercises = [], isLoading } = useExercises();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(search, 200);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(exercises.map((e) => e.category).filter((c): c is string => !!c)),
      ).sort(),
    [exercises],
  );

  const filteredExercises = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return exercises.filter((exercise) => {
      if (term && !exercise.name.toLowerCase().includes(term)) return false;
      if (category && exercise.category !== category) return false;
      if (difficulty && exercise.difficulty !== difficulty) return false;
      return true;
    });
  }, [exercises, debouncedSearch, category, difficulty]);

  const openCreateForm = () => {
    setEditingExercise(null);
    setFormOpen(true);
  };

  const openEditForm = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormOpen(true);
  };

  return (
    <>
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        gap={3}
        mb={6}
      >
        <Heading size="md">Exercises</Heading>
        <Button colorPalette="brand" onClick={openCreateForm}>
          New exercise
        </Button>
      </Flex>

      <ExerciseFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        categories={categories}
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <ExerciseTable exercises={filteredExercises} onEdit={openEditForm} />
      )}

      <ExerciseFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        exercise={editingExercise}
      />
    </>
  );
}
