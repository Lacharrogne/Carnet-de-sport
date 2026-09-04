import { supabase } from '../services/supabaseClient'
import {
  MEASUREMENTS_CHANGE_EVENT,
  readMeasurements,
  replaceLocalMeasurements,
  type BodyMeasurementEntry,
} from '../services/measurementsStorage'
import {
  deleteMeasurement,
  fetchMeasurements,
  upsertMeasurement,
} from '../services/bodyMeasurementsService'
import { diffMeasurements, hasAnyMeasure } from './measurementsDiff'

/**
 * Synchronise les mensurations avec le compte.
 *
 * L'écran reste instantané : on continue d'écrire sur l'appareil, et cette
 * couche répercute ensuite les changements, date par date.
 *
 * À la connexion :
 *  - si le compte a déjà des mensurations, elles font foi ;
 *  - s'il n'en a aucune et que l'appareil en contient, celles-ci sont
 *    **poussées vers le compte** — personne ne perd son historique.
 *
 * Module initialisé au chargement (importé par `main.tsx`).
 */

let currentUserId: string | null = null
let synced: BodyMeasurementEntry[] | null = null
let applyingRemote = false

function applyRemote(apply: () => void) {
  applyingRemote = true
  try {
    apply()
  } finally {
    applyingRemote = false
  }
}

async function hydrateFromAccount(userId: string) {
  const remote = await fetchMeasurements(userId)

  // Lecture impossible : on garde l'appareil et on ne pousse rien, pour ne pas
  // écraser le compte sur la foi d'une information incomplète.
  if (remote === null) return

  const local = readMeasurements()

  if (remote.length === 0 && local.length > 0) {
    for (const entry of local) {
      if (hasAnyMeasure(entry)) {
        await upsertMeasurement(userId, entry)
      }
    }
    synced = local
    return
  }

  applyRemote(() => replaceLocalMeasurements(remote))
  synced = remote
}

async function pushDiff(userId: string, next: BodyMeasurementEntry[]) {
  const ops = diffMeasurements(synced, next)
  synced = next

  for (const op of ops) {
    if (op.type === 'set') {
      await upsertMeasurement(userId, op.entry)
    } else {
      await deleteMeasurement(userId, op.date)
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener(MEASUREMENTS_CHANGE_EVENT, () => {
    if (applyingRemote || !currentUserId) return
    void pushDiff(currentUserId, readMeasurements())
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    const userId = session?.user?.id ?? null
    if (userId === currentUserId) return

    currentUserId = userId
    synced = null

    if (userId) {
      void hydrateFromAccount(userId)
    }
  })
}
