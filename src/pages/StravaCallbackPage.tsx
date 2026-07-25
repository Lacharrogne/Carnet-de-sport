import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { exchangeStravaCode } from '../services/stravaService'

export default function StravaCallbackPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('Connexion à Strava en cours…')
  const [error, setError] = useState('')
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) {
      return
    }
    ranRef.current = true

    const params = new URLSearchParams(window.location.search)
    const stravaError = params.get('error')
    const code = params.get('code')

    if (stravaError) {
      setError('Autorisation refusée sur Strava.')
      return
    }

    if (!code) {
      setError('Code d’autorisation Strava manquant.')
      return
    }

    exchangeStravaCode(code)
      .then(() => {
        setMessage('Strava connecté ! Redirection vers ton profil…')
        window.setTimeout(() => navigate('/profile', { replace: true }), 1200)
      })
      .catch((caught) => {
        setError(
          caught instanceof Error
            ? caught.message
            : 'La connexion à Strava a échoué.',
        )
      })
  }, [navigate])

  return (
    <main className="flex min-h-screen items-center justify-center px-5 text-slate-50">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-5xl">{error ? '⚠️' : '◈'}</p>

        <h1 className="mt-4 text-2xl font-black text-white">
          {error ? 'Connexion Strava' : 'Strava'}
        </h1>

        {error ? (
          <>
            <p className="mt-3 text-sm leading-6 text-red-200">{error}</p>
            <Link
              to="/profile"
              className="mt-6 inline-flex rounded-full bg-azur-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-azur-300"
            >
              Retour au profil
            </Link>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>
        )}
      </section>
    </main>
  )
}
