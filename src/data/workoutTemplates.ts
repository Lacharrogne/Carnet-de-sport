import type { WorkoutTemplate } from '../types/workoutTemplate'

/** Modèles fictifs utilisés en mode démo (non sauvegardés). */
export const DEMO_WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'demo-tpl-push',
    name: 'Séance PUSH (pecs / épaules / triceps)',
    category: 'musculation',
    payload: {
      title: 'Séance PUSH',
      category: 'musculation',
      date: '',
      duration: 60,
      intensity: 'Moyenne',
      feeling: 'Bon',
      notes: '',
      improvementIdea: '',
      trend: 'stable',
      details: {
        strengthExercises: [
          {
            id: 'tpl-push-1',
            name: 'Développé couché',
            sets: '4',
            reps: '8',
            weight: '',
            rest: '2 min',
            notes: '',
          },
          {
            id: 'tpl-push-2',
            name: 'Développé militaire',
            sets: '4',
            reps: '10',
            weight: '',
            rest: '90 s',
            notes: '',
          },
          {
            id: 'tpl-push-3',
            name: 'Dips',
            sets: '3',
            reps: '12',
            weight: '',
            rest: '90 s',
            notes: '',
          },
          {
            id: 'tpl-push-4',
            name: 'Extensions à la poulie',
            sets: '3',
            reps: '15',
            weight: '',
            rest: '60 s',
            notes: '',
          },
        ],
      },
    },
  },
  {
    id: 'demo-tpl-run',
    name: 'Footing endurance 5 km',
    category: 'course',
    payload: {
      title: 'Footing endurance',
      category: 'course',
      date: '',
      duration: 30,
      intensity: 'Facile',
      feeling: 'Bon',
      notes: 'Allure tranquille, respiration contrôlée.',
      improvementIdea: '',
      trend: 'stable',
      details: {
        distance: 5,
      },
    },
  },
]
