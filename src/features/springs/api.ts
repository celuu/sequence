import { supabase } from "../../lib/supabase/client";
import type { SpringType } from "../../types/domain";

const SPRING_TYPE_COLUMNS =
  "id, userId:user_id, name, colorHex:color_hex, sortOrder:sort_order, createdAt:created_at, updatedAt:updated_at";

export interface SpringTypeInput {
  name: string;
  colorHex: string | null;
}

export class SpringTypeInUseError extends Error {}

export async function listSpringTypes(): Promise<SpringType[]> {
  const { data, error } = await supabase
    .from("spring_types")
    .select(SPRING_TYPE_COLUMNS)
    .order("sort_order");
  if (error) throw error;
  return data as unknown as SpringType[];
}

export async function createSpringType(
  userId: string,
  input: SpringTypeInput,
  sortOrder: number,
): Promise<SpringType> {
  const { data, error } = await supabase
    .from("spring_types")
    .insert({
      user_id: userId,
      name: input.name,
      color_hex: input.colorHex,
      sort_order: sortOrder,
    })
    .select(SPRING_TYPE_COLUMNS)
    .single();
  if (error) throw error;
  return data as unknown as SpringType;
}

export async function updateSpringType(
  id: string,
  input: SpringTypeInput,
): Promise<SpringType> {
  const { data, error } = await supabase
    .from("spring_types")
    .update({ name: input.name, color_hex: input.colorHex })
    .eq("id", id)
    .select(SPRING_TYPE_COLUMNS)
    .single();
  if (error) throw error;
  return data as unknown as SpringType;
}

export async function deleteSpringType(id: string): Promise<void> {
  const { error } = await supabase.from("spring_types").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new SpringTypeInUseError(
        "Can't delete — this spring type is used in one or more workout blocks.",
      );
    }
    throw error;
  }
}
