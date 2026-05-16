import { supabase } from './supabaseClient'
import type { WeeklyGoal } from '../types/weeklyGoal'

const WEEKLY_GOAL_STORAGE_KEY = 'carnet-de-sport-weekly-goal'

type WeeklyGoalRow = {
  user_id: string
  target_minutes: number
}

export const DEFAULT_WEEKLY_GOAL: WeeklyGoal = {
  targetMinutes: 180,
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

export function getStoredWeeklyGoal() {
  const storedWeeklyGoal = localStorage.getItem(WEEKLY_GOAL_STORAGE_KEY)

  if (!storedWeeklyGoal) {
    return null
  }

  try {
    return JSON.parse(storedWeeklyGoal) as WeeklyGoal
  } catch {
    return null
  }
}

export function saveWeeklyGoal(weeklyGoal: WeeklyGoal) {
  localStorage.setItem(WEEKLY_GOAL_STORAGE_KEY, JSON.stringify(weeklyGoal))
}

export async function getRemoteWeeklyGoal(userId: string) {
  const { data, error } = await supabase
    .from('weekly_goals')
    .select('user_id, target_minutes')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Erreur chargement objectif hebdo Supabase :', error)
    return null
  }

  if (!data) {
    return null
  }

  return mapWeeklyGoalRowToWeeklyGoal(data)
}

export async function saveRemoteWeeklyGoal(
  weeklyGoal: WeeklyGoal,
  userId: string
) {
  const { error } = await supabase
    .from('weekly_goals')
    .upsert(mapWeeklyGoalToUpsert(weeklyGoal, userId), {
      onConflict: 'user_id',
    })

  if (error) {
    console.error('Erreur sauvegarde objectif hebdo Supabase :', error)
  }
}