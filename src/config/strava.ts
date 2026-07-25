// Configuration Strava (front). Le secret client n'est JAMAIS ici : il vit
// uniquement dans la fonction Edge Supabase. Ici on n'a que l'ID public.

const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID as string | undefined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

export const STRAVA_CLIENT_ID = clientId ?? ''

/** Vrai si l'intégration Strava est configurée (ID public présent). */
export const STRAVA_ENABLED = Boolean(clientId)

/** URL de la fonction Edge Supabase qui gère OAuth + synchronisation. */
export const STRAVA_FUNCTION_URL = `${supabaseUrl}/functions/v1/strava`

const STRAVA_SCOPE = 'activity:read_all'

export function getStravaRedirectUri() {
  return `${window.location.origin}/strava/callback`
}

/** URL d'autorisation Strava vers laquelle rediriger l'utilisateur. */
export function getStravaAuthUrl() {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: getStravaRedirectUri(),
    response_type: 'code',
    scope: STRAVA_SCOPE,
    approval_prompt: 'auto',
  })

  return `https://www.strava.com/oauth/authorize?${params.toString()}`
}
