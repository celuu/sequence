import type { BlockSide } from "../../types/domain";

export type ImportCategory = "Glute Ramp" | "Reformer" | null;

export interface ParsedBlockCandidate {
  rawSourceLine: string;
  exerciseName: string;
  matchedExistingName: string | null;
  category: ImportCategory;
  durationSeconds: number | null;
  side: BlockSide;
  notes: string | null;
  needsReview: boolean;
  reviewReason: string | null;
}

export interface ParsedImport {
  workoutName: string | null;
  blocks: ParsedBlockCandidate[];
}

export type DraftBlockStatus = "ready" | "new" | "needs-review" | "skipped";

export interface DraftBlock {
  id: string;
  exerciseName: string;
  exerciseId: string | null;
  category: string | null;
  durationSeconds: number | null;
  side: BlockSide;
  notes: string | null;
  status: DraftBlockStatus;
  reviewReason: string | null;
}
