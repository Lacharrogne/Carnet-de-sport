import { supabase } from './supabaseClient'
import { STRAVA_FUNCTION_URL } from '../config/strava'

export type StravaStatus = {
  connected: boolean
  athlete_name: string | null
  last_sync_at: string | null
}

async function callStrava<T>(
  action: string,
  extra: Record<string, unknown> = {},
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Connecte-toi pour utiliser Strava.')
  }

  const response = await fetch(STRAVA_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, ...extra }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      (data as { error?: string }).error ??
        'La connexion à Strava a échoué. Réessaie plus tard.',
    )
  }

  return data as T
}

/** État de la connexion Strava de l'utilisateur courant. */
export function getStravaStatus() {
  return callStrava<StravaStatus>('status')
}

/** Échange le code OAuth (après retour de Strava) contre des jetons. */
export function exchangeStravaCode(code: string) {
  return callStrava<{ ok: boolean; athlete_name: string | null }>('exchange', {
    code,
  })
}

/** Importe les nouvelles activités Strava dans le carnet. */
export function syncStrava() {
  return callStrava<{ ok: boolean; imported: number }>('sync')
}

/** Déconnecte Strava (les séances déjà importées sont conservées). */
export function disconnectStrava() {
  return callStrava<{ ok: boolean }>('disconnect')
}
