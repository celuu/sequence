import { NavLink, Outlet } from "react-router-dom";
import { Box, Button, Flex, HStack, Spacer, Text } from "@chakra-ui/react";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../auth/useAuth";

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  fontWeight: isActive ? 700 : 500,
  opacity: isActive ? 1 : 0.7,
});

export function AppShell() {
  const { user } = useAuth();

  return (
    <Flex direction="column" minH="100vh">
      <Flex
        as="header"
        align="center"
        gap={6}
        px={6}
        py={3}
        borderBottomWidth="1px"
        bg="white"
      >
        <Text fontWeight={700}>Sequence</Text>
        <HStack as="nav" gap={4}>
          <NavLink to="/" style={navLinkStyle} end>
            Dashboard
          </NavLink>
          <NavLink to="/workouts" style={navLinkStyle}>
            Workouts
          </NavLink>
          <NavLink to="/exercises" style={navLinkStyle}>
            Exercises
          </NavLink>
          <NavLink to="/settings/springs" style={navLinkStyle}>
            Springs
          </NavLink>
        </HStack>
        <Spacer />
        <Text fontSize="sm" color="gray.600">
          {user?.email}
        </Text>
        <Button size="sm" variant="outline" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </Flex>
      <Box as="main" flex={1} p={6}>
        <Outlet />
      </Box>
    </Flex>
  );
}
