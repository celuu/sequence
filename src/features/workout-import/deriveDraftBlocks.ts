import type { Exercise } from "../../types/domain";
import type { DraftBlock, ParsedBlockCandidate } from "./types";

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

let nextDraftId = 0;

export function toDraftBlocks(
  candidates: ParsedBlockCandidate[],
  existingExercises: Exercise[],
): DraftBlock[] {
  const byNormalizedName = new Map(
    existingExercises.map((exercise) => [normalize(exercise.name), exercise]),
  );

  return candidates.map((candidate) => {
    const claimedMatch = candidate.matchedExistingName
      ? byNormalizedName.get(normalize(candidate.matchedExistingName))
      : undefined;
    const fallbackMatch = byNormalizedName.get(normalize(candidate.exerciseName));
    const matched = claimedMatch ?? fallbackMatch ?? null;

    const missingDuration = candidate.durationSeconds == null;
    const status: DraftBlock["status"] =
      candidate.needsReview || missingDuration
        ? "needs-review"
        : matched
          ? "ready"
          : "new";

    return {
      id: `draft-${nextDraftId++}`,
      exerciseName: matched?.name ?? candidate.exerciseName,
      exerciseId: matched?.id ?? null,
      category: candidate.category,
      durationSeconds: candidate.durationSeconds,
      side: candidate.side,
      notes: candidate.notes,
      status,
      reviewReason:
        candidate.reviewReason ?? (missingDuration ? "missing duration" : null),
    };
  });
}
