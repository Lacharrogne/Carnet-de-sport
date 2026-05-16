import { supabase } from './supabaseClient'
import type { PlannedWorkout } from '../types/plannedWorkout'

const PLANNED_WORKOUTS_STORAGE_KEY = 'carnet-de-sport-planned-workouts'

type PlannedWorkoutRow = {
  id: string
  user_id: string
  title: string
  category: PlannedWorkout['category']
  date: string
  duration: number
  objective: string
  created_at?: string
}

function mapPlannedWorkoutRowToPlannedWorkout(
  row: PlannedWorkoutRow,
): PlannedWorkout {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.date,
    duration: row.duration,
    objective: row.objective,
  }
}

function mapPlannedWorkoutToInsert(
  plannedWorkout: PlannedWorkout,
  userId: string,
): PlannedWorkoutRow {
  return {
    id: plannedWorkout.id,
    user_id: userId,
    title: plannedWorkout.title,
    category: plannedWorkout.category,
    date: plannedWorkout.date,
    duration: plannedWorkout.duration,
    objective: plannedWorkout.objective,
  }
}

export function getStoredPlannedWorkouts() {
  const storedPlannedWorkouts = localStorage.getItem(
    PLANNED_WORKOUTS_STORAGE_KEY,
  )

  if (!storedPlannedWorkouts) {
    return null
  }

  try {
    return JSON.parse(storedPlannedWorkouts) as PlannedWorkout[]
  } catch {
    return null
  }
}

export function savePlannedWorkouts(plannedWorkouts: PlannedWorkout[]) {
  localStorage.setItem(
    PLANNED_WORKOUTS_STORAGE_KEY,
    JSON.stringify(plannedWorkouts),
  )
}

export async function getRemotePlannedWorkouts(userId: string) {
  const { data, error } = await supabase
    .from('planned_workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) =>
    mapPlannedWorkoutRowToPlannedWorkout(row as PlannedWorkoutRow),
  )
}

export async function saveRemotePlannedWorkouts(
  plannedWorkouts: PlannedWorkout[],
  userId: string,
) {
  const rows = plannedWorkouts.map((plannedWorkout) =>
    mapPlannedWorkoutToInsert(plannedWorkout, userId),
  )

  const { error: deleteError } = await supabase
    .from('planned_workouts')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    throw deleteError
  }

  if (rows.length === 0) {
    return
  }

  const { error: insertError } = await supabase
    .from('planned_workouts')
    .insert(rows)

  if (insertError) {
    throw insertError
  }
}