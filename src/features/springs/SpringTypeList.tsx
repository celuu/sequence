import { useState } from "react";
import { Alert, Box, Menu, Portal, Table, Text } from "@chakra-ui/react";
import type { SpringType } from "../../types/domain";
import { ConfirmDeleteDialog } from "../../components/ui/ConfirmDeleteDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { SpringTypeInUseError } from "./api";
import { useDeleteSpringType } from "./hooks";

interface SpringTypeListProps {
  springTypes: SpringType[];
  onEdit: (springType: SpringType) => void;
}

export function SpringTypeList({ springTypes, onEdit }: SpringTypeListProps) {
  const [deleteTarget, setDeleteTarget] = useState<SpringType | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteSpringType = useDeleteSpringType();

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteSpringType.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      if (error instanceof SpringTypeInUseError) {
        setDeleteError(error.message);
      } else {
        setDeleteError("Something went wrong deleting this spring type.");
      }
    }
  };

  if (springTypes.length === 0) {
    return (
      <EmptyState
        title="No spring types yet"
        description="Add a custom spring type to use in your workouts."
      />
    );
  }

  return (
    <>
      {deleteError && (
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Title>{deleteError}</Alert.Title>
        </Alert.Root>
      )}
      <Table.Root size="sm" interactive maxW="480px">
        <Table.Body>
          {springTypes.map((springType) => (
            <Table.Row key={springType.id}>
              <Table.Cell>
                <Box
                  boxSize="4"
                  borderRadius="full"
                  bg={springType.colorHex ?? "gray.300"}
                  borderWidth="1px"
                  display="inline-block"
                />
              </Table.Cell>
              <Table.Cell fontWeight={600}>{springType.name}</Table.Cell>
              <Table.Cell textAlign="end">
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Text as="button" cursor="pointer" px={2}>
                      ⋯
                    </Text>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item
                          value="edit"
                          onClick={() => onEdit(springType)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          value="delete"
                          color="red.600"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(springType);
                          }}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete spring type"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        isLoading={deleteSpringType.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
