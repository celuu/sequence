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
import { useExercises } from "../exercises/hooks";
import { toDraftBlocks } from "./deriveDraftBlocks";
import { useCommitImport, useParseWorkoutText } from "./hooks";
import { ImportReviewStep } from "./ImportReviewStep";
import type { DraftBlock } from "./types";

const EXAMPLE_PLACEHOLDER = `Lagree 6/13
GR kneeling crunch 1.5
GR saw 1.5
R super crunch 2

Side plank - pulses 1
Mermaid 1.5`;

interface ImportWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (workoutId: string) => void;
}

export function ImportWorkoutModal({
  open,
  onOpenChange,
  onImported,
}: ImportWorkoutModalProps) {
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
              <ImportWorkoutModalBody
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

interface ImportWorkoutModalBodyProps {
  onDone: () => void;
  onImported: (workoutId: string) => void;
}

function ImportWorkoutModalBody({
  onDone,
  onImported,
}: ImportWorkoutModalBodyProps) {
  const { user } = useAuth();
  const { data: exercises = [] } = useExercises();
  const parseWorkoutText = useParseWorkoutText();
  const commitImport = useCommitImport();

  const [step, setStep] = useState<"paste" | "review">("paste");
  const [text, setText] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [draftBlocks, setDraftBlocks] = useState<DraftBlock[]>([]);

  const handleParse = async () => {
    const result = await parseWorkoutText.mutateAsync({
      text,
      existingExercises: exercises.map((e) => ({
        name: e.name,
        category: e.category,
      })),
    });
    setWorkoutName(result.workoutName?.trim() || "Imported workout");
    setDraftBlocks(toDraftBlocks(result.blocks, exercises));
    setStep("review");
  };

  const handleCommit = async () => {
    const workoutId = await commitImport.mutateAsync({
      userId: user!.id,
      workoutName: workoutName.trim() || "Imported workout",
      draftBlocks,
    });
    onDone();
    onImported(workoutId);
  };

  const committableCount = draftBlocks.filter(
    (d) => d.status !== "skipped" && d.durationSeconds != null && d.durationSeconds > 0,
  ).length;

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>
          {step === "paste" ? "Import from text" : "Review import"}
        </Dialog.Title>
      </Dialog.Header>
      <Dialog.Body maxH="65vh" overflowY="auto">
        {step === "paste" ? (
          <Stack gap={4}>
            <Text fontSize="sm" color="gray.500">
              Paste your class notes below. Each line should name an
              exercise — numbers are read as minutes.
            </Text>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={EXAMPLE_PLACEHOLDER}
              rows={16}
              fontFamily="mono"
              autoFocus
            />
            {parseWorkoutText.isError && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Title>
                  {parseWorkoutText.error instanceof Error
                    ? parseWorkoutText.error.message
                    : "Couldn't parse that text."}
                </Alert.Title>
              </Alert.Root>
            )}
          </Stack>
        ) : (
          <Stack gap={4}>
            <ImportReviewStep
              workoutName={workoutName}
              onWorkoutNameChange={setWorkoutName}
              draftBlocks={draftBlocks}
              onChange={setDraftBlocks}
              existingExercises={exercises}
            />
            {commitImport.isError && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Title>
                  {commitImport.error instanceof Error
                    ? commitImport.error.message
                    : "Couldn't create the workout."}
                </Alert.Title>
              </Alert.Root>
            )}
          </Stack>
        )}
      </Dialog.Body>
      <Dialog.Footer>
        {step === "review" && (
          <Button variant="outline" onClick={() => setStep("paste")}>
            Back
          </Button>
        )}
        <Dialog.ActionTrigger asChild>
          <Button variant="outline">Cancel</Button>
        </Dialog.ActionTrigger>
        {step === "paste" ? (
          <Button
            colorPalette="brand"
            onClick={handleParse}
            loading={parseWorkoutText.isPending}
            disabled={!text.trim()}
          >
            Parse
          </Button>
        ) : (
          <Button
            colorPalette="brand"
            onClick={handleCommit}
            loading={commitImport.isPending}
            disabled={committableCount === 0 || !workoutName.trim()}
          >
            Create workout ({committableCount})
          </Button>
        )}
      </Dialog.Footer>
      <Dialog.CloseTrigger asChild>
        <CloseButton size="sm" />
      </Dialog.CloseTrigger>
    </>
  );
}
