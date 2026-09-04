import {
  MEASUREMENT_FIELDS,
  type BodyMeasurementEntry,
} from '../services/measurementsStorage'

/**
 * Différences entre les mensurations déjà synchronisées et les nouvelles.
 *
 * Logique **pure** et testée : c'est elle qui décide ce qui est **supprimé**
 * sur le compte. Une erreur ici effacerait un historique de mensurations.
 */

export type MeasurementOp =
  | { type: 'set'; entry: BodyMeasurementEntry }
  | { type: 'delete'; date: string }

/** Une série sans aucune mesure renseignée n'a rien à faire en base. */
export function hasAnyMeasure(entry: BodyMeasurementEntry): boolean {
  return MEASUREMENT_FIELDS.some(
    (field) => typeof entry[field.key] === 'number',
  )
}

function sameMeasures(a: BodyMeasurementEntry, b: BodyMeasurementEntry): boolean {
  return MEASUREMENT_FIELDS.every((field) => a[field.key] === b[field.key])
}

/** Séries à écrire ou à supprimer pour passer de `previous` à `next`. */
export function diffMeasurements(
  previous: BodyMeasurementEntry[] | null,
  next: BodyMeasurementEntry[],
): MeasurementOp[] {
  const ops: MeasurementOp[] = []
  const before = new Map((previous ?? []).map((entry) => [entry.date, entry]))
  const seen = new Set<string>()

  for (const entry of next) {
    seen.add(entry.date)

    // Une série vidée de toutes ses mesures équivaut à une suppression : la
    // base refuse (à raison) une ligne entièrement vide.
    if (!hasAnyMeasure(entry)) {
      if (previous !== null && before.has(entry.date)) {
        ops.push({ type: 'delete', date: entry.date })
      }
      continue
    }

    const old = before.get(entry.date)
    if (!old || !sameMeasures(old, entry)) {
      ops.push({ type: 'set', entry })
    }
  }

  // Séries disparues de la liste locale.
  if (previous !== null) {
    for (const date of before.keys()) {
      if (!seen.has(date)) ops.push({ type: 'delete', date })
    }
  }

  return ops
}
