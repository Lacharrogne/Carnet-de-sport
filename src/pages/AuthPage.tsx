import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { signIn, signUp } from '../services/authService'

export default function AuthPage() {
  const navigate = useNavigate()

  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('maxime@mail.com')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    if (!email.trim()) {
      setErrorMessage('Entre une adresse email.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    try {
      setIsLoading(true)

      if (isRegistering) {
        await signUp(email.trim(), password)

        setSuccessMessage(
          'Compte créé. Tu peux maintenant te connecter avec tes identifiants.',
        )
        setIsRegistering(false)
        setPassword('')
        return
      }

      await signIn(email.trim(), password)
      navigate('/')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue. Réessaie.'

      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate('/')}
          className="mb-10 rounded-full border border-white/10 bg-white/5 px-6 py-4 font-bold text-white transition hover:bg-white/10"
        >
          ← Retour au dashboard
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
            <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 font-bold text-emerald-300">
              {isRegistering ? 'Création de compte' : 'Connexion'}
            </span>

            <h1 className="mt-14 max-w-3xl text-6xl font-black leading-tight tracking-tight md:text-7xl">
              {isRegistering ? 'Crée ton compte sportif.' : 'Connecte-toi à ton carnet.'}
            </h1>

            <p className="mt-8 max-w-3xl text-2xl leading-relaxed text-blue-100">
              Ton compte permettra ensuite de sauvegarder tes séances, ton corps,
              tes objectifs, tes défis et ta progression dans Supabase.
            </p>

            <div className="mt-14 rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-8">
              <h2 className="text-xl font-black uppercase tracking-[0.4em] text-emerald-300">
                Pourquoi se connecter ?
              </h2>

              <ul className="mt-8 space-y-5 text-xl leading-relaxed text-blue-100">
                <li>• Retrouver tes séances sur plusieurs appareils.</li>
                <li>• Garder ton historique même après fermeture du navigateur.</li>
                <li>• Préparer la future synchronisation avec tes autres sites.</li>
              </ul>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
            <h2 className="text-4xl font-black">
              {isRegistering ? 'Créer un compte' : 'Se connecter'}
            </h2>

            <p className="mt-5 text-xl text-blue-100">
              {isRegistering
                ? 'Crée ton compte pour commencer la sauvegarde.'
                : 'Connecte-toi pour retrouver tes données.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-12 space-y-8">
              <div>
                <label className="mb-4 block text-lg font-bold text-white">
                  Adresse email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="maxime@mail.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-xl text-white outline-none transition placeholder:text-blue-200/40 focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-4 block text-lg font-bold text-white">
                  Mot de passe
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-xl text-white outline-none transition placeholder:text-blue-200/40 focus:border-emerald-400"
                />
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-6 py-4 font-bold text-red-200">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-6 py-4 font-bold text-emerald-200">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-emerald-400 px-6 py-5 text-lg font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? 'Chargement...'
                  : isRegistering
                    ? 'Créer mon compte'
                    : 'Se connecter'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setIsRegistering((currentValue) => !currentValue)
                setErrorMessage('')
                setSuccessMessage('')
                setPassword('')
              }}
              className="mt-8 w-full rounded-full border border-white/10 bg-white/5 px-6 py-5 text-lg font-bold text-white transition hover:bg-white/10"
            >
              {isRegistering
                ? 'Déjà un compte ? Se connecter'
                : 'Pas encore de compte ? Créer un compte'}
            </button>
          </section>
        </div>
      </section>
    </main>
  )
}