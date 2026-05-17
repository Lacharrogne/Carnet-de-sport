import { supabase } from './supabaseClient'
import type { WeeklyGoal } from '../types/weeklyGoal'

export const DEFAULT_WEEKLY_GOAL: WeeklyGoal = {
  targetMinutes: 180,
}

type WeeklyGoalRow = {
  user_id: string
  target_minutes: number
}

function mapWeeklyGoalRowToWeeklyGoal(row: WeeklyGoalRow): WeeklyGoal {
  return {
    targetMinutes: row.target_minutes,
  }
}

function mapWeeklyGoalToUpsert(weeklyGoal: WeeklyGoal, userId: string) {
  return {
    user_id: userId,
    target_minutes: weeklyGoal.targetMinutes,
  }
}

export async function getRemoteWeeklyGoal(userId: string) {
  const { data, error } = await supabase
    .from('weekly_goals')
    .select('user_id, target_minutes')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return mapWeeklyGoalRowToWeeklyGoal(data)
}

export async function saveRemoteWeeklyGoal(
  weeklyGoal: WeeklyGoal,
  userId: string,
) {
  const { error } = await supabase
    .from('weekly_goals')
    .upsert(mapWeeklyGoalToUpsert(weeklyGoal, userId), {
      onConflict: 'user_id',
    })

  if (error) {
    throw error
  }
}