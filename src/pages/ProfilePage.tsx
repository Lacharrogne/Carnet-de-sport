import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

import { updateUserProfile, uploadUserAvatar } from '../services/authService'

type ProfilePageProps = {
  user: User | null
  onUserUpdate: (user: User) => void
  onBack: () => void
}

type UserMetadata = {
  display_name?: string
  full_name?: string
  name?: string
  avatar_url?: string
  avatar_path?: string
  picture?: string
}

export default function ProfilePage({
  user,
  onUserUpdate,
  onBack,
}: ProfilePageProps) {
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🔒</p>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Connecte-toi pour modifier ton profil.
          </h1>

          <p className="mt-3 text-slate-500">
            Ton pseudo et ta photo seront utilisés dans la navigation.
          </p>

          <Link
            to="/auth"
            className="mt-6 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Se connecter
          </Link>
        </section>
      </main>
    )
  }

  return (
    <ProfileForm
      key={user.id}
      user={user}
      onUserUpdate={onUserUpdate}
      onBack={onBack}
    />
  )
}

function ProfileForm({
  user,
  onUserUpdate,
  onBack,
}: {
  user: User
  onUserUpdate: (user: User) => void
  onBack: () => void
}) {
  const initialDisplayName = getUserDisplayName(user)
  const initialAvatarUrl = getUserAvatarUrl(user)
  const initialAvatarPath = getUserAvatarPath(user)

  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [avatarPath, setAvatarPath] = useState(initialAvatarPath)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(initialAvatarUrl)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [avatarHasError, setAvatarHasError] = useState(false)

  const displayInitials = getInitials(displayName || user.email || 'Sportif')

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      window.alert('Choisis une vraie image.')
      return
    }

    setAvatarFile(file)
    setAvatarHasError(false)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarUrl('')
    setAvatarPath('')
    setPreviewUrl('')
    setAvatarHasError(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const cleanedDisplayName = displayName.trim()

    if (!cleanedDisplayName) {
      window.alert('Ajoute un pseudo pour ton profil.')
      return
    }

    setIsSaving(true)
    setSuccessMessage('')

    try {
      let nextAvatarUrl = avatarUrl
      let nextAvatarPath = avatarPath

      if (avatarFile) {
        const uploadedAvatar = await uploadUserAvatar(user.id, avatarFile)

        nextAvatarUrl = uploadedAvatar.avatarUrl
        nextAvatarPath = uploadedAvatar.avatarPath
      }

      const updatedUser = await updateUserProfile({
        displayName: cleanedDisplayName,
        avatarUrl: nextAvatarUrl,
        avatarPath: nextAvatarPath,
      })

      setAvatarUrl(nextAvatarUrl)
      setAvatarPath(nextAvatarPath)
      setPreviewUrl(nextAvatarUrl)
      setAvatarFile(null)
      setAvatarHasError(false)
      setSuccessMessage('Profil mis à jour avec succès.')

      onUserUpdate(updatedUser)
    } catch (error) {
      console.error('Erreur modification profil :', error)

      const message =
        error instanceof Error
          ? error.message
          : "Le profil n'a pas pu être sauvegardé."

      window.alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          ← Retour au dashboard
        </button>

        <header className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm sm:p-8">
          <div className="relative grid gap-6 md:grid-cols-[1fr_300px] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Profil sportif
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Personnalise ton carnet.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Ajoute un pseudo et une photo pour donner une vraie identité à
                ton espace sportif.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
              {previewUrl && !avatarHasError ? (
                <img
                  src={previewUrl}
                  alt={displayName}
                  onError={() => setAvatarHasError(true)}
                  className="mx-auto h-32 w-32 rounded-full border border-emerald-200 object-cover shadow-sm"
                />
              ) : (
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-5xl font-bold text-emerald-700">
                  {displayInitials}
                </div>
              )}

              <p className="mt-4 truncate text-2xl font-bold text-slate-900">
                {displayName || 'Sportif'}
              </p>

              <p className="mt-1 truncate text-sm font-bold text-slate-500">
                {user.email}
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6">
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-700">Pseudo</span>

              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Ex : Maxime, Lacharrogne, Sportif du dimanche..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Photo de profil
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Formats conseillés : JPG, PNG ou WebP. Maximum 3 Mo.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">
                    Choisir une image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>

                  {(previewUrl || avatarFile) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="rounded-full border border-rose-200 bg-rose-50 px-6 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                    >
                      Retirer
                    </button>
                  )}
                </div>
              </div>

              {avatarFile ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  Image sélectionnée : {avatarFile.name}
                </div>
              ) : null}
            </div>

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Sauvegarde...' : 'Enregistrer le profil'}
              </button>

              <Link
                to="/challenges"
                className="rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-center text-sm font-bold text-slate-800 transition hover:bg-slate-100"
              >
                Voir mes défis
              </Link>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

function getUserMetadata(user: User | null): UserMetadata {
  return (user?.user_metadata ?? {}) as UserMetadata
}

function getUserDisplayName(user: User | null) {
  const metadata = getUserMetadata(user)

  return (
    metadata.display_name ||
    metadata.full_name ||
    metadata.name ||
    user?.email?.split('@')[0] ||
    'Sportif'
  )
}

function getUserAvatarUrl(user: User | null) {
  const metadata = getUserMetadata(user)

  return metadata.avatar_url || metadata.picture || ''
}

function getUserAvatarPath(user: User | null) {
  const metadata = getUserMetadata(user)

  return metadata.avatar_path || ''
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}