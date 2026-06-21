import { EmptyState as ChakraEmptyState, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <ChakraEmptyState.Root>
      <ChakraEmptyState.Content>
        <VStack gap={2}>
          <ChakraEmptyState.Title>{title}</ChakraEmptyState.Title>
          {description && (
            <ChakraEmptyState.Description>
              {description}
            </ChakraEmptyState.Description>
          )}
          {action}
        </VStack>
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
}
