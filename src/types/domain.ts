export type Difficulty = "beginner" | "intermediate" | "advanced";
export type BlockSide = "left" | "right" | "both" | "none";

export interface Exercise {
  id: string;
  userId: string;
  name: string;
  category: string | null;
  muscleGroups: string[] | null;
  difficulty: Difficulty | null;
  defaultDurationSeconds: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SpringType {
  id: string;
  userId: string;
  name: string;
  colorHex: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  totalDurationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutBlockSpring {
  id: string;
  workoutBlockId: string;
  springTypeId: string;
  count: number;
  springType?: SpringType;
}

export interface WorkoutBlock {
  id: string;
  workoutId: string;
  exerciseId: string;
  orderIndex: number;
  durationSeconds: number;
  side: BlockSide;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  exercise?: Exercise;
  springs: WorkoutBlockSpring[];
}

export interface WorkoutDetail extends Workout {
  blocks: WorkoutBlock[];
}
