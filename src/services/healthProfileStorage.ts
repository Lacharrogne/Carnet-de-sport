import { supabase } from './supabaseClient'
import type { HealthProfile } from '../types/health'

export const DEFAULT_HEALTH_PROFILE: HealthProfile = {
  height: 175,
  weight: 70,
  age: 25,
  goal: 'bien-etre',
  activityLevel: 'modere',
}

type HealthProfileRow = {
  user_id: string
  height_cm: number | null
  weight_kg: number | null
  age: number | null
  activity_level: HealthProfile['activityLevel'] | null
  main_goal: HealthProfile['goal'] | null
  updated_at: string
}

function mapHealthProfileRowToHealthProfile(
  row: HealthProfileRow,
): HealthProfile {
  return {
    height: row.height_cm ?? DEFAULT_HEALTH_PROFILE.height,
    weight: Number(row.weight_kg ?? DEFAULT_HEALTH_PROFILE.weight),
    age: row.age ?? DEFAULT_HEALTH_PROFILE.age,
    activityLevel:
      row.activity_level ?? DEFAULT_HEALTH_PROFILE.activityLevel,
    goal: row.main_goal ?? DEFAULT_HEALTH_PROFILE.goal,
  }
}

function mapHealthProfileToUpsert(
  profile: HealthProfile,
  userId: string,
): HealthProfileRow {
  return {
    user_id: userId,
    height_cm: profile.height,
    weight_kg: profile.weight,
    age: profile.age,
    activity_level: profile.activityLevel,
    main_goal: profile.goal,
    updated_at: new Date().toISOString(),
  }
}

export async function getRemoteHealthProfile(userId: string) {
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Erreur récupération profil santé Supabase :', error)
    throw error
  }

  if (!data) {
    return null
  }

  return mapHealthProfileRowToHealthProfile(data as HealthProfileRow)
}

export async function saveRemoteHealthProfile(
  profile: HealthProfile,
  userId: string,
) {
  const row = mapHealthProfileToUpsert(profile, userId)

  const { error } = await supabase
    .from('health_profiles')
    .upsert(row, { onConflict: 'user_id' })

  if (error) {
    console.error('Erreur sauvegarde profil santé Supabase :', error)
    throw error
  }
}