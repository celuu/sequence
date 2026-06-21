import { useState } from "react";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { useSpringTypes } from "../features/springs/hooks";
import { SpringTypeList } from "../features/springs/SpringTypeList";
import { SpringTypeFormModal } from "../features/springs/SpringTypeFormModal";
import { LoadingState } from "../components/ui/LoadingState";
import type { SpringType } from "../types/domain";

export default function SpringSettingsPage() {
  const { data: springTypes = [], isLoading } = useSpringTypes();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSpringType, setEditingSpringType] =
    useState<SpringType | null>(null);

  const openCreateForm = () => {
    setEditingSpringType(null);
    setFormOpen(true);
  };

  const openEditForm = (springType: SpringType) => {
    setEditingSpringType(springType);
    setFormOpen(true);
  };

  return (
    <>
      <Flex align="center" justify="space-between" mb={6}>
        <Heading size="md">Spring settings</Heading>
        <Button colorPalette="brand" onClick={openCreateForm}>
          New spring type
        </Button>
      </Flex>

      {isLoading ? (
        <LoadingState />
      ) : (
        <SpringTypeList springTypes={springTypes} onEdit={openEditForm} />
      )}

      <SpringTypeFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        springType={editingSpringType}
      />
    </>
  );
}
