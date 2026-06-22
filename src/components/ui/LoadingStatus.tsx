import { useEffect, useState } from "react";
import { Box, ProgressCircle, Stack, Text } from "@chakra-ui/react";

const PROGRESS_CAP = 92;
const TICK_MS = 100;

interface LoadingStatusProps {
  messages: readonly string[];
  estimatedDurationMs: number;
  intervalMs?: number;
  emoji?: string;
}

export function LoadingStatus({
  messages,
  estimatedDurationMs,
  intervalMs = 1800,
  emoji = "🏋️",
}: LoadingStatusProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((current) => Math.min(current + 1, messages.length - 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [messages, intervalMs]);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min((Date.now() - start) / estimatedDurationMs, 1);
      const eased = 1 - (1 - t) * (1 - t);
      setProgress(eased * PROGRESS_CAP);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [estimatedDurationMs]);

  return (
    <Stack gap={4} py={8} align="center">
      <ProgressCircle.Root value={progress} colorPalette="brand">
        <ProgressCircle.Circle css={{ "--size": "140px", "--thickness": "10px" }}>
          <ProgressCircle.Track />
          <ProgressCircle.Range strokeLinecap="round" />
        </ProgressCircle.Circle>
        <Box
          position="absolute"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="3xl"
          animation="bounce"
        >
          {emoji}
        </Box>
      </ProgressCircle.Root>
      <Text fontSize="sm" color="gray.600" minH="1.25em" textAlign="center">
        {messages[messageIndex]}
      </Text>
    </Stack>
  );
}
