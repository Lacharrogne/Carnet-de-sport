import type { SportCategoryId, WorkoutFormValues } from './workout'

/**
 * Modèle de séance réutilisable : un patron (nom + contenu) à partir duquel on
 * démarre une nouvelle séance en un clic. `payload` reprend les valeurs du
 * formulaire (la date est remplacée par le jour au moment de démarrer).
 */
export type WorkoutTemplate = {
  id: string
  name: string
  category: SportCategoryId
  payload: WorkoutFormValues
  createdAt?: string
}
