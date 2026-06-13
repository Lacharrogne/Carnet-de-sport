import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

import { signIn, signUp } from '../services/authService'

type AuthPageProps = {
  onBack?: () => void
  onAuthSuccess?: (user: User | null) => void
  onUserUpdate?: (user: User) => void
}

type AuthMode = 'sign-in' | 'sign-up'

export default function AuthPage({
  onBack,
  onAuthSuccess,
  onUserUpdate,
}: AuthPageProps) {
  const navigate = useNavigate()

  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const isSignIn = mode === 'sign-in'

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    navigate('/')
  }

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode)
    setMessage('')
    setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const cleanedDisplayName = displayName.trim()
    const cleanedEmail = email.trim()
    const cleanedPassword = password.trim()

    setMessage('')
    setErrorMessage('')

    if (!isSignIn && !cleanedDisplayName) {
      setErrorMessage('Ajoute un pseudo pour créer ton compte.')
      return
    }

    if (!cleanedEmail) {
      setErrorMessage('Ajoute une adresse email.')
      return
    }

    if (cleanedPassword.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setIsLoading(true)

    try {
      if (isSignIn) {
        const data = await signIn(cleanedEmail, cleanedPassword)

        if (data.user) {
          onUserUpdate?.(data.user)
        }

        onAuthSuccess?.(data.user ?? null)
        navigate('/')
        return
      }

      const data = await signUp(
        cleanedEmail,
        cleanedPassword,
        cleanedDisplayName,
      )

      if (data.user) {
        onUserUpdate?.(data.user)
      }

      onAuthSuccess?.(data.user ?? null)

      if (data.session) {
        navigate('/')
        return
      }

      setMessage(
        'Compte créé. Vérifie tes emails si Supabase demande une confirmation.',
      )
    } catch (error) {
      console.error('Erreur authentification :', error)

      const readableMessage =
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue pendant la connexion.'

      setErrorMessage(readableMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          ← Retour à l’accueil
        </button>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm sm:p-8">
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Carnet de sport
                </p>

                <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                  Retrouve ton suivi sportif partout.
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  Connecte-toi pour sauvegarder tes séances, ton planning, ta
                  progression, ton profil physique et tes défis.
                </p>
              </div>

              <div className="grid gap-3">
                <InfoLine icon="🏃" text="Tes séances restent enregistrées." />
                <InfoLine icon="📅" text="Ton planning te suit partout." />
                <InfoLine
                  icon="🎯"
                  text="Tes objectifs et défis sont conservés."
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1.5">
              <button
                type="button"
                onClick={() => handleModeChange('sign-in')}
                className={[
                  'rounded-full px-5 py-3 text-sm font-bold transition',
                  isSignIn
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
              >
                Connexion
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('sign-up')}
                className={[
                  'rounded-full px-5 py-3 text-sm font-bold transition',
                  !isSignIn
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
              >
                Inscription
              </button>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                {isSignIn ? 'Bon retour' : 'Nouveau compte'}
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                {isSignIn ? 'Se connecter' : 'Créer ton compte'}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {isSignIn
                  ? 'Entre tes identifiants pour retrouver ton carnet.'
                  : 'Choisis un pseudo et crée ton compte pour commencer à synchroniser tes données.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              {!isSignIn ? (
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Pseudo
                  </span>

                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Ex : Maxime, Lacharrogne, Sportif du dimanche..."
                    autoComplete="nickname"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700">
                  Adresse email
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="exemple@mail.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700">
                  Mot de passe
                </span>

                <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 caractères"
                    autoComplete={
                      isSignIn ? 'current-password' : 'new-password'
                    }
                    className="min-w-0 flex-1 bg-transparent px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setIsPasswordVisible((currentValue) => !currentValue)
                    }
                    className="px-4 text-sm font-bold text-slate-500 transition hover:text-slate-900"
                  >
                    {isPasswordVisible ? 'Masquer' : 'Voir'}
                  </button>
                </div>
              </label>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                  {errorMessage}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 rounded-full bg-emerald-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? isSignIn
                    ? 'Connexion...'
                    : 'Création...'
                  : isSignIn
                    ? 'Se connecter'
                    : 'Créer mon compte'}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold leading-6 text-slate-500">
                {isSignIn ? (
                  <>
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeChange('sign-up')}
                      className="font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Créer un compte
                    </button>
                  </>
                ) : (
                  <>
                    Tu as déjà un compte ?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeChange('sign-in')}
                      className="font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Se connecter
                    </button>
                  </>
                )}
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function InfoLine({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        {icon}
      </span>

      <p className="text-sm font-bold text-slate-600">{text}</p>
    </div>
  )
}