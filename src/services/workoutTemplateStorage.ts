import { supabase } from './supabaseClient'
import type { WorkoutTemplate } from '../types/workoutTemplate'
import type { SportCategoryId, WorkoutFormValues } from '../types/workout'

type WorkoutTemplateRow = {
  id: string
  user_id: string
  name: string
  category: string
  payload: WorkoutFormValues
  created_at: string
}

function mapRowToTemplate(row: WorkoutTemplateRow): WorkoutTemplate {
  return {
    id: row.id,
    name: row.name,
    category: row.category as SportCategoryId,
    payload: row.payload,
    createdAt: row.created_at,
  }
}

/** Modèles de séances de la personne, du plus récent au plus ancien. */
export async function getRemoteWorkoutTemplates(
  userId: string,
): Promise<WorkoutTemplate[]> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur récupération des modèles Supabase :', error)
    throw error
  }

  return (data as WorkoutTemplateRow[] | null)?.map(mapRowToTemplate) ?? []
}

export async function saveRemoteWorkoutTemplate(
  template: WorkoutTemplate,
  userId: string,
): Promise<WorkoutTemplate> {
  const { data, error } = await supabase
    .from('workout_templates')
    .insert({
      user_id: userId,
      name: template.name,
      category: template.category,
      payload: template.payload,
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur sauvegarde d’un modèle Supabase :', error)
    throw error
  }

  return mapRowToTemplate(data as WorkoutTemplateRow)
}

export async function deleteRemoteWorkoutTemplate(
  templateId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('workout_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId)

  if (error) {
    console.error('Erreur suppression d’un modèle Supabase :', error)
    throw error
  }
}
