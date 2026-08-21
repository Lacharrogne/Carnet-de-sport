/**
 * Bibliothèque d'exercices de musculation courants (en français), regroupés
 * par zone. Sert d'autocomplétion dans le formulaire de séance pour saisir
 * plus vite et garder des noms cohérents (utile au suivi par exercice).
 */
export type ExerciseGroup = {
  zone: string
  exercises: string[]
}

export const EXERCISE_GROUPS: ExerciseGroup[] = [
  {
    zone: 'Pectoraux',
    exercises: [
      'Développé couché',
      'Développé incliné',
      'Développé décliné',
      'Développé haltères',
      'Écarté couché',
      'Écarté à la poulie',
      'Pompes',
      'Dips',
    ],
  },
  {
    zone: 'Dos',
    exercises: [
      'Tractions',
      'Rowing barre',
      'Rowing haltère',
      'Tirage vertical',
      'Tirage horizontal',
      'Soulevé de terre',
      'Shrugs',
      'Pull-over',
    ],
  },
  {
    zone: 'Épaules',
    exercises: [
      'Développé militaire',
      'Développé Arnold',
      'Élévations latérales',
      'Élévations frontales',
      'Oiseau',
      'Face pull',
    ],
  },
  {
    zone: 'Biceps',
    exercises: [
      'Curl barre',
      'Curl haltères',
      'Curl marteau',
      'Curl pupitre',
      'Curl incliné',
    ],
  },
  {
    zone: 'Triceps',
    exercises: [
      'Extensions à la poulie',
      'Barre au front',
      'Extension nuque',
      'Kickback',
      'Dips triceps',
    ],
  },
  {
    zone: 'Jambes',
    exercises: [
      'Squat',
      'Presse à cuisses',
      'Fentes',
      'Soulevé de terre roumain',
      'Leg curl',
      'Leg extension',
      'Mollets debout',
      'Hip thrust',
      'Hack squat',
    ],
  },
  {
    zone: 'Abdominaux',
    exercises: [
      'Crunch',
      'Gainage',
      'Relevé de jambes',
      'Roue abdominale',
      'Russian twist',
      'Planche latérale',
    ],
  },
]

/** Liste à plat de tous les noms d'exercices, pour l'autocomplétion. */
export const EXERCISE_NAMES: string[] = EXERCISE_GROUPS.flatMap(
  (group) => group.exercises,
)
