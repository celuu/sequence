import { useState } from "react";
import {
  Alert,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useAuth } from "../../auth/useAuth";
import { LoadingStatus } from "../../components/ui/LoadingStatus";
import { useExercises } from "../exercises/hooks";
import { toDraftExercises } from "./deriveDraftExercises";
import { useCommitExerciseImport, useParseExerciseList } from "./hooks";
import { ImportExercisesReviewStep } from "./ImportExercisesReviewStep";
import type { DraftExercise } from "./types";

const EXAMPLE_PLACEHOLDER = `Center Core
All 1 yellow spring unless otherwise noted
Plank & Forearm Plank and variations (also reverse, giant reverse, giant)
Wheelbarrow (also reverse, giant reverse, giant)
Catfish/Giant Reverse catfish`;

const PARSE_MESSAGES = [
  "Reading your exercise list…",
  "Expanding variations…",
  "Matching against your library…",
  "Almost there…",
] as const;

const COMMIT_MESSAGES = [
  "Adding exercises to your library…",
  "Almost done…",
] as const;

function estimateParseDurationMs(textLength: number): number {
  return Math.min(Math.max(4000 + textLength * 8, 4000), 20000);
}

function estimateCommitDurationMs(count: number): number {
  return Math.min(Math.max(1000 + count * 250, 1000), 15000);
}

interface ImportExercisesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (count: number) => void;
}

export function ImportExercisesModal({
  open,
  onOpenChange,
  onImported,
}: ImportExercisesModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      size="xl"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            {open && (
              <ImportExercisesModalBody
                onDone={() => onOpenChange(false)}
                onImported={onImported}
              />
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

interface ImportExercisesModalBodyProps {
  onDone: () => void;
  onImported: (count: number) => void;
}

function ImportExercisesModalBody({
  onDone,
  onImported,
}: ImportExercisesModalBodyProps) {
  const { user } = useAuth();
  const { data: exercises = [] } = useExercises();
  const parseExerciseList = useParseExerciseList();
  const commitExerciseImport = useCommitExerciseImport();

  const [step, setStep] = useState<"paste" | "review">("paste");
  const [text, setText] = useState("");
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([]);

  const handleParse = async () => {
    const result = await parseExerciseList.mutateAsync({
      text,
      existingExercises: exercises.map((e) => ({ name: e.name })),
    });
    setDraftExercises(toDraftExercises(result.exercises, exercises));
    setStep("review");
  };

  const handleCommit = async () => {
    const count = await commitExerciseImport.mutateAsync({
      userId: user!.id,
      draftExercises,
    });
    onDone();
    onImported(count);
  };

  const createCount = draftExercises.filter((d) => d.status === "create").length;

  return (
    <>
      <Dialog.Header px={{ base: 4, md: 6 }}>
        <Dialog.Title>
          {step === "paste" ? "Import exercises from text" : "Review import"}
        </Dialog.Title>
      </Dialog.Header>
      <Dialog.Body px={{ base: 4, md: 6 }} maxH="65vh" overflowY="auto">
        {step === "paste" ? (
          parseExerciseList.isPending ? (
            <LoadingStatus
              messages={PARSE_MESSAGES}
              estimatedDurationMs={estimateParseDurationMs(text.length)}
              emoji="🧠"
            />
          ) : (
            <Stack gap={4}>
              <Text fontSize="sm" color="gray.500">
                Paste your exercise catalog below — section labels, equipment
                defaults, and "(also reverse, giant reverse, giant)" style
                variation lists are all understood.
              </Text>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={EXAMPLE_PLACEHOLDER}
                rows={16}
                fontFamily="mono"
                autoFocus
              />
              {parseExerciseList.isError && (
                <Alert.Root status="error">
                  <Alert.Indicator />
                  <Alert.Title>
                    {parseExerciseList.error instanceof Error
                      ? parseExerciseList.error.message
                      : "Couldn't parse that text."}
                  </Alert.Title>
                </Alert.Root>
              )}
            </Stack>
          )
        ) : commitExerciseImport.isPending ? (
          <LoadingStatus
            messages={COMMIT_MESSAGES}
            estimatedDurationMs={estimateCommitDurationMs(createCount)}
            emoji="📚"
          />
        ) : (
          <Stack gap={4}>
            <ImportExercisesReviewStep
              draftExercises={draftExercises}
              onChange={setDraftExercises}
            />
            {commitExerciseImport.isError && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Title>
                  {commitExerciseImport.error instanceof Error
                    ? commitExerciseImport.error.message
                    : "Couldn't create the exercises."}
                </Alert.Title>
              </Alert.Root>
            )}
          </Stack>
        )}
      </Dialog.Body>
      <Dialog.Footer px={{ base: 4, md: 6 }} flexWrap="wrap">
        {step === "review" && (
          <Button
            variant="outline"
            onClick={() => setStep("paste")}
            disabled={commitExerciseImport.isPending}
          >
            Back
          </Button>
        )}
        <Dialog.ActionTrigger asChild>
          <Button
            variant="outline"
            disabled={parseExerciseList.isPending || commitExerciseImport.isPending}
          >
            Cancel
          </Button>
        </Dialog.ActionTrigger>
        {step === "paste" ? (
          <Button
            colorPalette="brand"
            onClick={handleParse}
            loading={parseExerciseList.isPending}
            disabled={!text.trim()}
          >
            Parse
          </Button>
        ) : (
          <Button
            colorPalette="brand"
            onClick={handleCommit}
            loading={commitExerciseImport.isPending}
            disabled={createCount === 0}
          >
            Create {createCount} exercises
          </Button>
        )}
      </Dialog.Footer>
      <Dialog.CloseTrigger asChild>
        <CloseButton size="sm" />
      </Dialog.CloseTrigger>
    </>
  );
}
