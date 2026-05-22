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
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-slate-50">
      <section className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-slate-200 transition hover:bg-white/[0.1]"
        >
          ← Retour à l’accueil
        </button>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <section className="relative overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 via-white/[0.04] to-sky-400/10 p-6 shadow-2xl shadow-black/25 sm:p-8">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <p className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                  Carnet de sport
                </p>

                <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
                  Retrouve ton suivi sportif partout.
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
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

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-slate-950/50 p-1.5">
              <button
                type="button"
                onClick={() => handleModeChange('sign-in')}
                className={[
                  'rounded-full px-5 py-3 text-sm font-black transition',
                  isSignIn
                    ? 'bg-emerald-400 text-slate-950'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
                ].join(' ')}
              >
                Connexion
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('sign-up')}
                className={[
                  'rounded-full px-5 py-3 text-sm font-black transition',
                  !isSignIn
                    ? 'bg-emerald-400 text-slate-950'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
                ].join(' ')}
              >
                Inscription
              </button>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                {isSignIn ? 'Bon retour' : 'Nouveau compte'}
              </p>

              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                {isSignIn ? 'Se connecter' : 'Créer ton compte'}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {isSignIn
                  ? 'Entre tes identifiants pour retrouver ton carnet.'
                  : 'Choisis un pseudo et crée ton compte pour commencer à synchroniser tes données.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              {!isSignIn ? (
                <label className="block space-y-2">
                  <span className="text-sm font-black text-slate-200">
                    Pseudo
                  </span>

                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Ex : Maxime, Lacharrogne, Sportif du dimanche..."
                    autoComplete="nickname"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
                  />
                </label>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-black text-slate-200">
                  Adresse email
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="exemple@mail.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-black text-slate-200">
                  Mot de passe
                </span>

                <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 transition focus-within:border-emerald-400/60">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 caractères"
                    autoComplete={
                      isSignIn ? 'current-password' : 'new-password'
                    }
                    className="min-w-0 flex-1 bg-transparent px-4 py-4 text-white outline-none placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setIsPasswordVisible((currentValue) => !currentValue)
                    }
                    className="px-4 text-sm font-black text-slate-400 transition hover:text-white"
                  >
                    {isPasswordVisible ? 'Masquer' : 'Voir'}
                  </button>
                </div>
              </label>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200">
                  {errorMessage}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 rounded-full bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
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

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-sm font-bold leading-6 text-slate-400">
                {isSignIn ? (
                  <>
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeChange('sign-up')}
                      className="font-black text-emerald-300 hover:text-emerald-200"
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
                      className="font-black text-emerald-300 hover:text-emerald-200"
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
    <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl">
        {icon}
      </span>

      <p className="text-sm font-bold text-slate-300">{text}</p>
    </div>
  )
}