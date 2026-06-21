import { HStack, Input, NativeSelect } from "@chakra-ui/react";

interface ExerciseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  categories: string[];
}

export function ExerciseFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  categories,
}: ExerciseFiltersProps) {
  return (
    <HStack gap={3} mb={4}>
      <Input
        placeholder="Search exercises…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        maxW="280px"
      />
      <NativeSelect.Root maxW="200px">
        <NativeSelect.Field
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      <NativeSelect.Root maxW="200px">
        <NativeSelect.Field
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
        >
          <option value="">All difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </HStack>
  );
}
