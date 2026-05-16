import type { SportCategoryId } from '../types/workout'

export type SportCategory = {
  id: SportCategoryId
  label: string
  emoji: string
  description: string
}

export const SPORT_CATEGORIES: SportCategory[] = [
  {
    id: 'musculation',
    label: 'Musculation',
    emoji: '🏋️',
    description: 'Force, volume, séries et répétitions.',
  },
  {
    id: 'course',
    label: 'Course',
    emoji: '🏃',
    description: 'Endurance, distance et régularité.',
  },
  {
    id: 'natation',
    label: 'Natation',
    emoji: '🏊',
    description: 'Cardio, technique et respiration.',
  },
  {
    id: 'football',
    label: 'Football',
    emoji: '⚽',
    description: 'Matchs, entraînements et intensité.',
  },
  {
    id: 'velo',
    label: 'Vélo',
    emoji: '🚴',
    description: 'Sorties, cardio et puissance.',
  },
  {
    id: 'marche',
    label: 'Marche',
    emoji: '🚶',
    description: 'Activité douce et quotidienne.',
  },
  {
    id: 'mobilite',
    label: 'Mobilité',
    emoji: '🧘',
    description: 'Souplesse, récupération et équilibre.',
  },
  {
    id: 'autre',
    label: 'Autre',
    emoji: '✨',
    description: 'Toutes les autres activités.',
  },
]