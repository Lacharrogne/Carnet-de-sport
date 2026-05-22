import { supabase } from './supabaseClient'

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_SIZE = 3 * 1024 * 1024

export async function signUp(
  email: string,
  password: string,
  displayName: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName.trim(),
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return data.session
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return data.user
}

export function listenToAuthChanges(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  const { data } = supabase.auth.onAuthStateChange(callback)

  return data.subscription
}

type UpdateUserProfileParams = {
  displayName: string
  avatarUrl: string
  avatarPath?: string
}

export async function updateUserProfile({
  displayName,
  avatarUrl,
  avatarPath = '',
}: UpdateUserProfileParams) {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      avatar_url: avatarUrl,
      avatar_path: avatarPath,
    },
  })

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error('Utilisateur introuvable après modification du profil.')
  }

  return data.user
}

export async function uploadUserAvatar(userId: string, file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier choisi doit être une image.')
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error('La photo de profil ne doit pas dépasser 3 Mo.')
  }

  const extension = getAvatarExtension(file)
  const avatarPath = `${userId}/avatar-${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(avatarPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(avatarPath)

  return {
    avatarUrl: data.publicUrl,
    avatarPath,
  }
}

function getAvatarExtension(file: File) {
  if (file.type === 'image/png') {
    return 'png'
  }

  if (file.type === 'image/webp') {
    return 'webp'
  }

  return 'jpg'
}