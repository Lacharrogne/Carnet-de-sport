import { supabase } from './supabaseClient'
import type { BodyWeightEntry } from '../types/bodyWeight'

type BodyWeightRow = {
  id: string
  user_id: string
  date: string
  weight_kg: number | string | null
  note: string | null
}

function mapRowToEntry(row: BodyWeightRow): BodyWeightEntry {
  return {
    id: row.id,
    date: row.date,
    weight: Number(row.weight_kg ?? 0),
    note: row.note ?? undefined,
  }
}

/** Historique de pesées de la personne, du plus ancien au plus récent. */
export async function getRemoteBodyWeightEntries(
  userId: string,
): Promise<BodyWeightEntry[]> {
  const { data, error } = await supabase
    .from('body_weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) {
    console.error('Erreur récupération des pesées Supabase :', error)
    throw error
  }

  return (data as BodyWeightRow[] | null)?.map(mapRowToEntry) ?? []
}

/**
 * Enregistre (ou remplace) la pesée d'une date. Une seule pesée par jour
 * grâce à la contrainte unique (user_id, date).
 */
export async function saveRemoteBodyWeightEntry(
  entry: BodyWeightEntry,
  userId: string,
): Promise<BodyWeightEntry> {
  const { data, error } = await supabase
    .from('body_weight_entries')
    .upsert(
      {
        user_id: userId,
        date: entry.date,
        weight_kg: entry.weight,
        note: entry.note ?? null,
      },
      { onConflict: 'user_id,date' },
    )
    .select()
    .single()

  if (error) {
    console.error('Erreur sauvegarde d’une pesée Supabase :', error)
    throw error
  }

  return mapRowToEntry(data as BodyWeightRow)
}

export async function deleteRemoteBodyWeightEntry(
  entryId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('body_weight_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId)

  if (error) {
    console.error('Erreur suppression d’une pesée Supabase :', error)
    throw error
  }
}
