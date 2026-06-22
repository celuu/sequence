import type { Difficulty } from "../../types/domain";

export interface ParsedExerciseCandidate {
  rawSourceLine: string;
  name: string;
  matchedExistingName: string | null;
  muscleGroups: string[] | null;
  category: string | null;
  difficulty: Difficulty | null;
  notes: string | null;
  needsReview: boolean;
  reviewReason: string | null;
}

export interface ParsedExerciseList {
  sectionLabel: string | null;
  exercises: ParsedExerciseCandidate[];
}

export type DraftExerciseStatus = "create" | "duplicate";

export interface DraftExercise {
  id: string;
  name: string;
  muscleGroups: string[] | null;
  category: string | null;
  difficulty: Difficulty | null;
  notes: string | null;
  status: DraftExerciseStatus;
  needsReview: boolean;
  reviewReason: string | null;
  matchedExistingName: string | null;
}
