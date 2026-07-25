import { useEffect, useState } from 'react'

import { STRAVA_ENABLED, getStravaAuthUrl } from '../config/strava'
import {
  disconnectStrava,
  getStravaStatus,
  syncStrava,
  type StravaStatus,
} from '../services/stravaService'

type StravaConnectionCardProps = {
  /** Appelé après un import réussi pour rafraîchir les séances. */
  onImported?: () => void
}

export default function StravaConnectionCard({
  onImported,
}: StravaConnectionCardProps) {
  const [status, setStatus] = useState<StravaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!STRAVA_ENABLED) {
      setLoading(false)
      return
    }

    let active = true

    getStravaStatus()
      .then((next) => {
        if (active) setStatus(next)
      })
      .catch(() => {
        if (active) setStatus({ connected: false, athlete_name: null, last_sync_at: null })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleConnect = () => {
    window.location.href = getStravaAuthUrl()
  }

  const handleSync = async () => {
    setBusy(true)
    setError('')
    setMessage('')

    try {
      const result = await syncStrava()
      setMessage(
        result.imported > 0
          ? `${result.imported} activité${
              result.imported > 1 ? 's' : ''
            } importée${result.imported > 1 ? 's' : ''} depuis Strava.`
          : 'Tout est déjà à jour, aucune nouvelle activité.',
      )
      onImported?.()
      const next = await getStravaStatus()
      setStatus(next)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Synchronisation impossible.')
    } finally {
      setBusy(false)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Déconnecter Strava ? Les séances déjà importées seront conservées.')) {
      return
    }

    setBusy(true)
    setError('')
    setMessage('')

    try {
      await disconnectStrava()
      setStatus({ connected: false, athlete_name: null, last_sync_at: null })
      setMessage('Strava a été déconnecté.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Déconnexion impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-azur-300">
            Connexions
          </p>

          <h2 className="mt-2 flex items-center gap-2 text-2xl font-black text-white sm:text-3xl">
            <span className="text-[#fc4c02]">◈</span> Strava
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Importe automatiquement tes activités Strava (course, vélo,
            natation…) comme séances de ton carnet, sans double saisie.
          </p>
        </div>

        {status?.connected ? (
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300">
            Connecté
          </span>
        ) : null}
      </div>

      {!STRAVA_ENABLED ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-sm leading-6 text-slate-400">
          L’intégration Strava n’est pas encore activée sur cet environnement.
          Elle apparaîtra ici dès que la configuration sera en place.
        </div>
      ) : loading ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">
          Vérification de la connexion…
        </div>
      ) : status?.connected ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            {status.athlete_name ? (
              <p className="font-black text-white">{status.athlete_name}</p>
            ) : (
              <p className="font-black text-white">Compte Strava lié</p>
            )}

            <p className="mt-1 text-sm text-slate-400">
              {status.last_sync_at
                ? `Dernière synchro : ${formatDateTime(status.last_sync_at)}`
                : 'Aucune synchronisation pour le moment.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSync}
              disabled={busy}
              className="rounded-full bg-[#fc4c02] px-6 py-3 text-sm font-black text-white transition hover:bg-[#e34402] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Synchronisation…' : '↻ Synchroniser mes activités'}
            </button>

            <button
              type="button"
              onClick={handleDisconnect}
              disabled={busy}
              className="rounded-full border border-red-400/20 bg-red-400/10 px-6 py-3 text-sm font-black text-red-200 transition hover:bg-red-400/20 disabled:opacity-60"
            >
              Déconnecter
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleConnect}
            className="inline-flex items-center gap-2 rounded-full bg-[#fc4c02] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#e34402]"
          >
            Connecter mon compte Strava
          </button>
        </div>
      )}

      {message ? (
        <p className="mt-4 rounded-2xl border border-azur-400/20 bg-azur-400/10 px-4 py-3 text-sm font-bold text-azur-200">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      ) : null}
    </section>
  )
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
