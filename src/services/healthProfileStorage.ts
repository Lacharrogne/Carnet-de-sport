import type {
  ActivityLevel,
  FitnessGoal,
  HealthProfile,
} from '../types/health'
import { supabase } from './supabaseClient'

const HEALTH_PROFILE_STORAGE_KEY = 'carnet-de-sport-health-profile'

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
  main_goal: FitnessGoal | null
  activity_level: ActivityLevel | null
}

function mapHealthProfileRowToHealthProfile(
  row: HealthProfileRow,
): HealthProfile {
  return {
    height: row.height_cm ?? DEFAULT_HEALTH_PROFILE.height,
    weight: row.weight_kg ?? DEFAULT_HEALTH_PROFILE.weight,
    age: row.age ?? DEFAULT_HEALTH_PROFILE.age,
    goal: row.main_goal ?? DEFAULT_HEALTH_PROFILE.goal,
    activityLevel: row.activity_level ?? DEFAULT_HEALTH_PROFILE.activityLevel,
  }
}

function mapHealthProfileToUpsert(profile: HealthProfile, userId: string) {
  return {
    user_id: userId,
    height_cm: profile.height,
    weight_kg: profile.weight,
    age: profile.age,
    main_goal: profile.goal,
    activity_level: profile.activityLevel,
    updated_at: new Date().toISOString(),
  }
}

export function getStoredHealthProfile() {
  const storedProfile = localStorage.getItem(HEALTH_PROFILE_STORAGE_KEY)

  if (!storedProfile) {
    return null
  }

  try {
    return JSON.parse(storedProfile) as HealthProfile
  } catch {
    return null
  }
}

export function saveHealthProfile(profile: HealthProfile) {
  localStorage.setItem(HEALTH_PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export async function getRemoteHealthProfile(userId: string) {
  const { data, error } = await supabase
    .from('health_profiles')
    .select('user_id, height_cm, weight_kg, age, main_goal, activity_level')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Erreur chargement profil santé Supabase :', error)
    return null
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
  const { error } = await supabase
    .from('health_profiles')
    .upsert(mapHealthProfileToUpsert(profile, userId), {
      onConflict: 'user_id',
    })

  if (error) {
    console.error('Erreur sauvegarde profil santé Supabase :', error)
  }
}