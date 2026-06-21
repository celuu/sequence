import { Center, Spinner } from "@chakra-ui/react";

export function LoadingState() {
  return (
    <Center py={16}>
      <Spinner size="lg" />
    </Center>
  );
}
