import type { Exercise } from "../../types/domain";
import type { DraftExercise, ParsedExerciseCandidate } from "./types";

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

let nextDraftId = 0;

export function toDraftExercises(
  candidates: ParsedExerciseCandidate[],
  existingExercises: Exercise[],
): DraftExercise[] {
  const byNormalizedName = new Map(
    existingExercises.map((exercise) => [normalize(exercise.name), exercise]),
  );
  const seenInBatch = new Set<string>();

  return candidates.map((candidate) => {
    const normalized = normalize(candidate.name);
    const claimedMatch = candidate.matchedExistingName
      ? byNormalizedName.get(normalize(candidate.matchedExistingName))
      : undefined;
    const fallbackMatch = byNormalizedName.get(normalized);
    const matched = claimedMatch ?? fallbackMatch ?? null;
    const isRepeatInBatch = seenInBatch.has(normalized);
    seenInBatch.add(normalized);

    return {
      id: `draft-${nextDraftId++}`,
      name: candidate.name,
      muscleGroups: candidate.muscleGroups,
      category: candidate.category,
      difficulty: candidate.difficulty,
      notes: candidate.notes,
      status: matched || isRepeatInBatch ? "duplicate" : "create",
      needsReview: candidate.needsReview,
      reviewReason: candidate.reviewReason,
      matchedExistingName:
        matched?.name ?? (isRepeatInBatch ? "earlier in this paste" : null),
    };
  });
}
