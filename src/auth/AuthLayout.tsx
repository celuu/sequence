import { Outlet } from "react-router-dom";
import { Box, Center, Heading, VStack } from "@chakra-ui/react";

export function AuthLayout() {
  return (
    <Center minH="100vh" bg="gray.50" px={4}>
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md" w="full" maxW="380px">
        <VStack align="stretch" gap={6}>
          <Heading size="lg" textAlign="center">
            Sequence
          </Heading>
          <Outlet />
        </VStack>
      </Box>
    </Center>
  );
}
