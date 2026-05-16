import type { HealthProfile } from '../types/health'

const HEALTH_PROFILE_STORAGE_KEY = 'carnet-de-sport-health-profile'

export const DEFAULT_HEALTH_PROFILE: HealthProfile = {
  height: 175,
  weight: 70,
  age: 25,
  goal: 'bien-etre',
  activityLevel: 'modere',
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