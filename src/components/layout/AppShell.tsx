import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  HStack,
  IconButton,
  Portal,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../auth/useAuth";

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  fontWeight: isActive ? 700 : 500,
  opacity: isActive ? 1 : 0.7,
});

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/workouts", label: "Workouts", end: false },
  { to: "/exercises", label: "Exercises", end: false },
  { to: "/settings/springs", label: "Springs", end: false },
];

export function AppShell() {
  const { user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <Flex direction="column" minH="100vh">
      <Flex
        as="header"
        align="center"
        gap={{ base: 3, md: 6 }}
        px={{ base: 4, md: 6 }}
        py={3}
        borderBottomWidth="1px"
        bg="white"
      >
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          size="sm"
          display={{ base: "inline-flex", md: "none" }}
          onClick={() => setNavOpen(true)}
        >
          ☰
        </IconButton>
        <Text fontWeight={700}>Sequence</Text>
        <HStack as="nav" gap={4} display={{ base: "none", md: "flex" }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} style={navLinkStyle} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </HStack>
        <Spacer />
        <Text
          fontSize="sm"
          color="gray.600"
          display={{ base: "none", md: "block" }}
        >
          {user?.email}
        </Text>
        <Button
          size="sm"
          variant="outline"
          display={{ base: "none", md: "inline-flex" }}
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </Button>
      </Flex>
      <Box as="main" flex={1} p={{ base: 4, md: 6 }}>
        <Outlet />
      </Box>

      <Drawer.Root
        open={navOpen}
        onOpenChange={(details) => setNavOpen(details.open)}
        placement="start"
        size="xs"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Sequence</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <Stack
                  as="nav"
                  gap={4}
                  fontSize="lg"
                  onClick={() => setNavOpen(false)}
                >
                  {NAV_ITEMS.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      style={navLinkStyle}
                      end={item.end}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </Stack>
              </Drawer.Body>
              <Drawer.Footer>
                <Stack gap={2} w="full">
                  <Text fontSize="sm" color="gray.600">
                    {user?.email}
                  </Text>
                  <Button
                    variant="outline"
                    onClick={() => supabase.auth.signOut()}
                  >
                    Sign out
                  </Button>
                </Stack>
              </Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Flex>
  );
}
