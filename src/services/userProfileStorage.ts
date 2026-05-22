import { supabase } from './supabaseClient'
import type { UserProfile } from '../types/userProfile'

type UserProfileRow = {
  user_id: string
  display_name: string
  avatar: string | null
  created_at?: string
  updated_at?: string
}

function cleanDisplayName(value: string) {
  return value.trim()
}

function createNameFromEmail(email?: string | null) {
  if (!email) {
    return 'Sportif'
  }

  const namePart = email.split('@')[0] ?? ''

  return (
    namePart
      .replace(/[._-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(' ') || 'Sportif'
  )
}

function mapRowToUserProfile(row: UserProfileRow): UserProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    avatar: row.avatar ?? '',
  }
}

function mapUserProfileToRow(profile: UserProfile): UserProfileRow {
  return {
    user_id: profile.userId,
    display_name: cleanDisplayName(profile.displayName),
    avatar: profile.avatar || null,
  }
}

export function createDefaultUserProfile(
  userId: string,
  email?: string | null,
): UserProfile {
  return {
    userId,
    displayName: createNameFromEmail(email),
    avatar: '',
  }
}

export async function getRemoteUserProfile(
  userId: string,
  email?: string | null,
) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return createDefaultUserProfile(userId, email)
  }

  return mapRowToUserProfile(data as UserProfileRow)
}

export async function saveRemoteUserProfile(profile: UserProfile) {
  const row = {
    ...mapUserProfileToRow(profile),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(row, {
      onConflict: 'user_id',
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapRowToUserProfile(data as UserProfileRow)
}