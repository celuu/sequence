import { supabase } from "../../lib/supabase/client";
import type { BlockSide, WorkoutDetail } from "../../types/domain";

const WORKOUT_DETAIL_COLUMNS = `
  id, userId:user_id, name, description, totalDurationSeconds:total_duration_seconds, createdAt:created_at, updatedAt:updated_at,
  blocks:workout_blocks (
    id, workoutId:workout_id, exerciseId:exercise_id, orderIndex:order_index, durationSeconds:duration_seconds, side, notes, createdAt:created_at, updatedAt:updated_at,
    exercise:exercises ( id, userId:user_id, name, category, muscleGroups:muscle_groups, difficulty, defaultDurationSeconds:default_duration_seconds, notes, createdAt:created_at, updatedAt:updated_at ),
    springs:workout_block_springs (
      id, workoutBlockId:workout_block_id, springTypeId:spring_type_id, count,
      springType:spring_types ( id, userId:user_id, name, colorHex:color_hex, sortOrder:sort_order, createdAt:created_at, updatedAt:updated_at )
    )
  )
`;

export interface BlockSpringInput {
  springTypeId: string;
  count: number;
}

export interface BlockInput {
  exerciseId: string;
  side: BlockSide;
  durationSeconds: number;
  notes: string | null;
  springs: BlockSpringInput[];
}

export async function getWorkoutDetail(id: string): Promise<WorkoutDetail> {
  const { data, error } = await supabase
    .from("workouts")
    .select(WORKOUT_DETAIL_COLUMNS)
    .eq("id", id)
    .order("order_index", { referencedTable: "blocks" })
    .single();
  if (error) throw error;
  return data as unknown as WorkoutDetail;
}

async function replaceBlockSprings(
  blockId: string,
  springs: BlockSpringInput[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("workout_block_springs")
    .delete()
    .eq("workout_block_id", blockId);
  if (deleteError) throw deleteError;

  if (springs.length === 0) return;

  const { error: insertError } = await supabase
    .from("workout_block_springs")
    .insert(
      springs.map((s) => ({
        workout_block_id: blockId,
        spring_type_id: s.springTypeId,
        count: s.count,
      })),
    );
  if (insertError) throw insertError;
}

export async function createBlock(
  workoutId: string,
  nextOrderIndex: number,
  input: BlockInput,
): Promise<void> {
  const { data, error } = await supabase
    .from("workout_blocks")
    .insert({
      workout_id: workoutId,
      exercise_id: input.exerciseId,
      order_index: nextOrderIndex,
      duration_seconds: input.durationSeconds,
      side: input.side,
      notes: input.notes,
    })
    .select("id")
    .single();
  if (error) throw error;
  await replaceBlockSprings(data.id, input.springs);
}

export async function updateBlock(
  blockId: string,
  input: BlockInput,
): Promise<void> {
  const { error } = await supabase
    .from("workout_blocks")
    .update({
      exercise_id: input.exerciseId,
      duration_seconds: input.durationSeconds,
      side: input.side,
      notes: input.notes,
    })
    .eq("id", blockId);
  if (error) throw error;
  await replaceBlockSprings(blockId, input.springs);
}

export async function deleteBlock(blockId: string): Promise<void> {
  const { error } = await supabase
    .from("workout_blocks")
    .delete()
    .eq("id", blockId);
  if (error) throw error;
}

export async function reorderBlocks(
  workoutId: string,
  orderedBlockIds: string[],
): Promise<void> {
  const { error } = await supabase.rpc("reorder_workout_blocks", {
    p_workout_id: workoutId,
    p_block_ids: orderedBlockIds,
  });
  if (error) throw error;
}

export async function updateWorkoutMeta(
  workoutId: string,
  input: { name: string; description: string | null },
): Promise<void> {
  const { error } = await supabase
    .from("workouts")
    .update({ name: input.name, description: input.description })
    .eq("id", workoutId);
  if (error) throw error;
}
