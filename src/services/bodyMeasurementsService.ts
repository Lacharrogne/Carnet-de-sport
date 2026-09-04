import { supabase } from './supabaseClient'
import {
  MEASUREMENT_FIELDS,
  type BodyMeasurementEntry,
  type MeasurementField,
} from './measurementsStorage'

/**
 * Mensurations rattachées au compte (table `body_measurements`).
 * Une ligne par date ; les cinq mesures sont facultatives.
 */

/** Nom de la colonne en base pour chaque mesure. */
const COLUMN: Record<MeasurementField, string> = {
  waist: 'waist_cm',
  chest: 'chest_cm',
  arm: 'arm_cm',
  thigh: 'thigh_cm',
  hips: 'hips_cm',
}

type Row = { date: string } & Partial<Record<string, number | string | null>>

function mapRowToEntry(row: Row): BodyMeasurementEntry {
  const entry: BodyMeasurementEntry = { id: row.date, date: row.date }

  for (const field of MEASUREMENT_FIELDS) {
    const value = row[COLUMN[field.key]]
    if (value !== null && value !== undefined) {
      entry[field.key] = Number(value)
    }
  }

  return entry
}

/** Lit les mensurations du compte. `null` = lecture impossible. */
export async function fetchMeasurements(
  userId: string,
): Promise<BodyMeasurementEntry[] | null> {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('date, waist_cm, chest_cm, arm_cm, thigh_cm, hips_cm')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('fetchMeasurements', error)
    return null
  }

  return ((data ?? []) as Row[]).map(mapRowToEntry)
}

/** Enregistre (ou remplace) la série de mesures d'une date. */
export async function upsertMeasurement(
  userId: string,
  entry: BodyMeasurementEntry,
): Promise<boolean> {
  const row: Record<string, unknown> = { user_id: userId, date: entry.date }

  for (const field of MEASUREMENT_FIELDS) {
    const value = entry[field.key]
    row[COLUMN[field.key]] = typeof value === 'number' ? value : null
  }

  const { error } = await supabase
    .from('body_measurements')
    .upsert(row, { onConflict: 'user_id,date' })

  if (error) {
    console.error('upsertMeasurement', error)
    return false
  }
  return true
}

/** Supprime la série de mesures d'une date. */
export async function deleteMeasurement(
  userId: string,
  date: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('body_measurements')
    .delete()
    .eq('user_id', userId)
    .eq('date', date)

  if (error) {
    console.error('deleteMeasurement', error)
    return false
  }
  return true
}
