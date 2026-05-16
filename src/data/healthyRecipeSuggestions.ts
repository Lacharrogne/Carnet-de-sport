import type { FitnessGoal } from '../types/health'

export type HealthyRecipeSuggestion = {
  id: string
  title: string
  emoji: string
  description: string
  tag: string
  goal: FitnessGoal
}

export const HEALTHY_RECIPE_SUGGESTIONS: HealthyRecipeSuggestion[] = [
  {
    id: 'protein-meal',
    title: 'Repas riche en protéines',
    emoji: '🍗',
    description: 'Idéal après une séance de musculation pour aider à la récupération.',
    tag: 'proteine',
    goal: 'prise-de-muscle',
  },
  {
    id: 'light-meal',
    title: 'Repas léger',
    emoji: '🥗',
    description: 'Une idée simple pour manger équilibré sans trop alourdir la journée.',
    tag: 'healthy',
    goal: 'perte-de-poids',
  },
  {
    id: 'energy-meal',
    title: 'Repas énergie',
    emoji: '🍝',
    description: 'Parfait avant ou après une séance cardio, course, foot ou vélo.',
    tag: 'energie',
    goal: 'endurance',
  },
  {
    id: 'balanced-meal',
    title: 'Repas équilibré',
    emoji: '🍲',
    description: 'Une assiette complète pour garder une bonne routine alimentaire.',
    tag: 'equilibre',
    goal: 'bien-etre',
  },
  {
    id: 'performance-meal',
    title: 'Repas performance',
    emoji: '🥙',
    description: 'Une recette pensée pour soutenir les séances intenses.',
    tag: 'performance',
    goal: 'performance',
  },
]