import { createClient } from '@supabase/supabase-js'

import { isSharedDomain, sharedAuthStorage } from './sharedAuthStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

// On accepte les différents noms de clé publique selon les environnements
// (le projet commun « Les Carnets » utilise une clé publishable).
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_KEY) as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Variables Supabase manquantes. Vérifie VITE_SUPABASE_URL et la clé publique.',
  )
}

// Sur `*.lescarnets.app`, la session est partagée entre les sous-domaines
// (SSO) via un cookie sur le domaine racine ; ailleurs, comportement par défaut.
const authOptions = isSharedDomain()
  ? {
      auth: {
        storage: sharedAuthStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  : undefined

export const supabase = createClient(supabaseUrl, supabaseKey, authOptions)
