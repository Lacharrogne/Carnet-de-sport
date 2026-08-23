import { useEffect, useState } from 'react'

/**
 * Mensurations corporelles (par appareil, via localStorage).
 *
 * Complète le suivi du poids : tour de taille, poitrine, bras, cuisse, hanches
 * (en cm). Stockage local (pas de synchronisation multi-appareils pour cette
 * première version).
 */

export type MeasurementField = 'waist' | 'chest' | 'arm' | 'thigh' | 'hips'

export type BodyMeasurementEntry = {
  /** Une entrée par date (l'id est la date). */
  id: string
  date: string
} & Partial<Record<MeasurementField, number>>

export const MEASUREMENT_FIELDS: {
  key: MeasurementField
  label: string
  emoji: string
}[] = [
  { key: 'waist', label: 'Tour de taille', emoji: '📏' },
  { key: 'chest', label: 'Poitrine', emoji: '🫁' },
  { key: 'arm', label: 'Bras', emoji: '💪' },
  { key: 'thigh', label: 'Cuisse', emoji: '🦵' },
  { key: 'hips', label: 'Hanches', emoji: '🧍' },
]

const STORAGE_KEY = 'cs-body-measurements'
const CHANGE_EVENT = 'cs-body-measurements-change'

function read(): BodyMeasurementEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(entries: BodyMeasurementEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
  } catch {
    // Stockage indisponible (mode privé) : on ignore.
  }
}

/** Hook réactif : liste des mensurations + ajout/suppression. */
export function useMeasurements() {
  const [entries, setEntries] = useState<BodyMeasurementEntry[]>(() => read())

  useEffect(() => {
    const handler = () => setEntries(read())
    window.addEventListener(CHANGE_EVENT, handler)
    return () => window.removeEventListener(CHANGE_EVENT, handler)
  }, [])

  function addEntry(entry: BodyMeasurementEntry) {
    // Une seule entrée par date : on remplace celle du même jour.
    const others = read().filter((item) => item.id !== entry.id)
    write([entry, ...others])
  }

  function deleteEntry(id: string) {
    write(read().filter((item) => item.id !== id))
  }

  return { entries, addEntry, deleteEntry }
}
