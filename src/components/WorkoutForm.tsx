import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import { EXERCISE_NAMES } from '../data/exerciseLibrary'
import type {
  SportCategoryId,
  StrengthExercise,
  Workout,
  WorkoutDetails,
  WorkoutFeeling,
  WorkoutFormValues,
  WorkoutIntensity,
  WorkoutTrend,
} from '../types/workout'
import {
  formatLastPerformance,
  getLastPerformance,
  getOverloadSuggestion,
} from '../services/progressiveOverloadService'

type WorkoutFormProps = {
  initialValues?: WorkoutFormValues
  submitLabel?: string
  onSubmit: (values: WorkoutFormValues) => void
  onCancel: () => void
  /** Historique des séances, pour la surcharge progressive (dernière perf). */
  workouts?: Workout[]
}

type DetailMode =
  | 'strength'
  | 'endurance'
  | 'bike'
  | 'swim'
  | 'mobility'
  | 'climb'
  | 'simple'

const intensityOptions: WorkoutIntensity[] = ['Facile', 'Moyenne', 'Difficile']

const feelingOptions: WorkoutFeeling[] = [
  'Très mauvais',
  'Mauvais',
  'Correct',
  'Bon',
  'Excellent',
]

const trendOptions: { value: WorkoutTrend; label: string; emoji: string }[] = [
  { value: 'first', label: 'Première séance', emoji: '🌱' },
  { value: 'progress', label: 'Progression', emoji: '📈' },
  { value: 'stable', label: 'Stable', emoji: '⚖️' },
  { value: 'regress', label: 'Régression', emoji: '📉' },
  { value: 'record', label: 'Record', emoji: '🔥' },
]

function getDetailMode(category: SportCategoryId): DetailMode {
  if (category === 'musculation') {
    return 'strength'
  }

  if (
    category === 'course' ||
    category === 'trail' ||
    category === 'marche' ||
    category === 'randonnee'
  ) {
    return 'endurance'
  }

  if (category === 'velo' || category === 'vtt') {
    return 'bike'
  }

  if (category === 'natation') {
    return 'swim'
  }

  if (category === 'hiit' || category === 'yoga') {
    return 'mobility'
  }

  if (category === 'escalade') {
    return 'climb'
  }

  return 'simple'
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function createEmptyStrengthExercise(): StrengthExercise {
  return {
    id: createId(),
    name: '',
    sets: '',
    reps: '',
    weight: '',
    rest: '',
    notes: '',
  }
}

function getInitialDetails(initialValues?: WorkoutFormValues): WorkoutDetails {
  const details = initialValues?.details

  if (!details) {
    return {}
  }

  const hasModernStrengthExercises =
    details.strengthExercises && details.strengthExercises.length > 0

  const hasOldStrengthDetails =
    details.exercises || details.sets || details.reps || details.weight

  if (
    initialValues?.category === 'musculation' &&
    !hasModernStrengthExercises &&
    hasOldStrengthDetails
  ) {
    return {
      bodyZones: details.bodyZones,
      strengthExercises: [
        {
          id: createId(),
          name: details.exercises ?? '',
          sets: details.sets ? String(details.sets) : '',
          reps: details.reps ? String(details.reps) : '',
          weight: details.weight ? String(details.weight) : '',
          rest: '',
          notes: '',
        },
      ],
    }
  }

  return details
}

/**
 * Brouillon d'une NOUVELLE séance, sauvegardé au fil de la saisie.
 *
 * Sur mobile, quitter l'app (pour consulter une note, par ex.) puis y revenir
 * recharge souvent la page → l'état React du formulaire est perdu. On persiste
 * donc la saisie en cours dans le téléphone pour la restaurer au retour.
 */
const WORKOUT_DRAFT_KEY = 'sport-nouvelle-seance-draft'

type WorkoutDraft = {
  title: string
  category: SportCategoryId
  date: string
  duration: string
  intensity: WorkoutIntensity
  feeling: WorkoutFeeling
  trend: WorkoutTrend
  notes: string
  improvementIdea: string
  details: WorkoutDetails
}

function loadWorkoutDraft(): WorkoutDraft | null {
  try {
    const raw = localStorage.getItem(WORKOUT_DRAFT_KEY)
    return raw ? (JSON.parse(raw) as WorkoutDraft) : null
  } catch {
    return null
  }
}

function saveWorkoutDraft(draft: WorkoutDraft) {
  try {
    localStorage.setItem(WORKOUT_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    /* stockage indisponible : on ignore */
  }
}

function clearWorkoutDraft() {
  try {
    localStorage.removeItem(WORKOUT_DRAFT_KEY)
  } catch {
    /* ignore */
  }
}

function draftHasContent(draft: WorkoutDraft | null): boolean {
  if (!draft) return false
  return Boolean(
    draft.title.trim() ||
      draft.duration.trim() ||
      draft.notes.trim() ||
      draft.improvementIdea.trim() ||
      (draft.details && Object.keys(draft.details).length > 0),
  )
}

export default function WorkoutForm({
  initialValues,
  submitLabel = 'Enregistrer la séance',
  onSubmit,
  onCancel,
  workouts = [],
}: WorkoutFormProps) {
  const today = new Date().toISOString().split('T')[0]

  // Brouillon uniquement pour une nouvelle séance (pas en édition).
  const isNewWorkout = !initialValues
  const [draft] = useState<WorkoutDraft | null>(() =>
    isNewWorkout ? loadWorkoutDraft() : null,
  )

  const [title, setTitle] = useState(
    initialValues?.title ?? draft?.title ?? '',
  )
  const [category, setCategory] = useState<SportCategoryId>(
    initialValues?.category ?? draft?.category ?? 'musculation',
  )
  const [date, setDate] = useState(
    initialValues?.date ?? draft?.date ?? today,
  )
  const [duration, setDuration] = useState(
    initialValues?.duration
      ? String(initialValues.duration)
      : draft?.duration ?? '',
  )
  const [intensity, setIntensity] = useState<WorkoutIntensity>(
    initialValues?.intensity ?? draft?.intensity ?? 'Moyenne',
  )
  const [feeling, setFeeling] = useState<WorkoutFeeling>(
    initialValues?.feeling ?? draft?.feeling ?? 'Bon',
  )
  const [trend, setTrend] = useState<WorkoutTrend>(
    initialValues?.trend ?? draft?.trend ?? 'first',
  )
  const [notes, setNotes] = useState(
    initialValues?.notes ?? draft?.notes ?? '',
  )
  const [improvementIdea, setImprovementIdea] = useState(
    initialValues?.improvementIdea ?? draft?.improvementIdea ?? '',
  )
  const [details, setDetails] = useState<WorkoutDetails>(
    () => draft?.details ?? getInitialDetails(initialValues),
  )

  const [showDraftNotice, setShowDraftNotice] = useState(() =>
    draftHasContent(draft),
  )

  // Sauvegarde continue du brouillon (nouvelle séance uniquement), pour
  // survivre à un rechargement de la page quand on quitte puis revient.
  useEffect(() => {
    if (!isNewWorkout) return

    const current: WorkoutDraft = {
      title,
      category,
      date,
      duration,
      intensity,
      feeling,
      trend,
      notes,
      improvementIdea,
      details,
    }

    if (draftHasContent(current)) {
      saveWorkoutDraft(current)
    }
  }, [
    isNewWorkout,
    title,
    category,
    date,
    duration,
    intensity,
    feeling,
    trend,
    notes,
    improvementIdea,
    details,
  ])

  const handleDiscardDraft = () => {
    clearWorkoutDraft()
    setShowDraftNotice(false)
    setTitle('')
    setCategory('musculation')
    setDate(today)
    setDuration('')
    setIntensity('Moyenne')
    setFeeling('Bon')
    setTrend('first')
    setNotes('')
    setImprovementIdea('')
    setDetails({})
  }

  const updateDetail = <Key extends keyof WorkoutDetails>(
    key: Key,
    value: WorkoutDetails[Key],
  ) => {
    setDetails((currentDetails) => ({
      ...currentDetails,
      [key]: value,
    }))
  }

  const handleCategoryChange = (newCategory: SportCategoryId) => {
    setCategory(newCategory)
    setDetails({})
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const cleanedTitle = title.trim()
    const cleanedDuration = Number(duration)

    if (!cleanedTitle) {
      alert('Donne un nom à ta séance.')
      return
    }

    if (!duration || cleanedDuration <= 0) {
      alert('Ajoute une durée valide.')
      return
    }

    onSubmit({
      title: cleanedTitle,
      category,
      date,
      duration: cleanedDuration,
      intensity,
      feeling,
      notes: notes.trim(),
      improvementIdea: improvementIdea.trim(),
      trend,
      details: cleanWorkoutDetails(category, details),
    })

    // Séance enregistrée : on efface le brouillon.
    if (isNewWorkout) {
      clearWorkoutDraft()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showDraftNotice && (
        <div className="flex flex-col gap-2 rounded-2xl border border-azur-500/30 bg-azur-500/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-azur-100">
            ✍️ On a récupéré ta saisie en cours, tu peux continuer.
          </p>

          <button
            type="button"
            onClick={handleDiscardDraft}
            className="shrink-0 self-start rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 ring-1 ring-white/15 transition hover:bg-white/20 sm:self-auto"
          >
            Repartir de zéro
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">
            Nom de la séance
          </span>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex : Séance PUSH, footing, sortie vélo..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/60"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Catégorie</span>

          <select
            value={category}
            onChange={(event) =>
              handleCategoryChange(event.target.value as SportCategoryId)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
          >
            {SPORT_CATEGORIES.map((sportCategory) => (
              <option key={sportCategory.id} value={sportCategory.id}>
                {sportCategory.emoji} {sportCategory.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Date</span>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">
            Durée en minutes
          </span>

          <input
            type="number"
            min="1"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="Ex : 45"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/60"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Intensité</span>

          <select
            value={intensity}
            onChange={(event) =>
              setIntensity(event.target.value as WorkoutIntensity)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
          >
            {intensityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Ressenti</span>

          <select
            value={feeling}
            onChange={(event) =>
              setFeeling(event.target.value as WorkoutFeeling)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
          >
            {feelingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <SportSpecificFields
        category={category}
        details={details}
        workouts={workouts}
        onChange={updateDetail}
      />

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-200">
          Progression ressentie
        </span>

        <select
          value={trend}
          onChange={(event) => setTrend(event.target.value as WorkoutTrend)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
        >
          {trendOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.emoji} {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-200">
          Notes sur la séance
        </span>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="Ex : Bonne séance, mais j’ai manqué d’énergie sur la fin."
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/60"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-200">
          Idée d’amélioration pour la prochaine fois
        </span>

        <textarea
          value={improvementIdea}
          onChange={(event) => setImprovementIdea(event.target.value)}
          rows={3}
          placeholder="Ex : Mieux gérer les temps de repos ou ajouter 5 minutes de cardio."
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/60"
        />
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10"
        >
          Annuler
        </button>

        <button
          type="submit"
          className="rounded-full bg-azur-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-azur-300"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

type SportSpecificFieldsProps = {
  category: SportCategoryId
  details: WorkoutDetails
  workouts: Workout[]
  onChange: <Key extends keyof WorkoutDetails>(
    key: Key,
    value: WorkoutDetails[Key],
  ) => void
}

function SportSpecificFields({
  category,
  details,
  workouts,
  onChange,
}: SportSpecificFieldsProps) {
  const detailMode = getDetailMode(category)

  return (
    <section className="rounded-[2rem] border border-azur-400/10 bg-azur-400/5 p-5">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-azur-300">
        Détails spécifiques
      </p>

      <p className="mt-2 text-sm text-slate-400">
        Ces champs changent selon le sport choisi.
      </p>

      {detailMode === 'strength' ? (
        <div className="mt-5 space-y-5">
          <TextField
            label="Zones travaillées"
            value={details.bodyZones ?? ''}
            placeholder="Ex : pectoraux, triceps, épaules"
            onChange={(value) => onChange('bodyZones', value)}
          />

          <StrengthExercisesEditor
            exercises={details.strengthExercises ?? []}
            onChange={(exercises) => onChange('strengthExercises', exercises)}
            workouts={workouts}
          />
        </div>
      ) : null}

      {detailMode === 'endurance' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={details.exercises ?? ''}
            placeholder="Ex : échauffement, fractionné, retour au calme..."
            onChange={(value) => onChange('exercises', value)}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <NumberDetailField
              label={
                category === 'marche' || category === 'randonnee'
                  ? 'Distance en km'
                  : 'Distance en km'
              }
              value={details.distance}
              placeholder="Ex : 5"
              onChange={(value) => onChange('distance', value)}
            />

            <TextField
              label="Allure"
              value={details.pace ?? ''}
              placeholder="Ex : 6:20/km"
              onChange={(value) => onChange('pace', value)}
            />

            <NumberDetailField
              label="Dénivelé en mètres"
              value={details.elevation}
              placeholder="Ex : 250"
              onChange={(value) => onChange('elevation', value)}
            />

            <TextField
              label="Zones travaillées"
              value={details.bodyZones ?? ''}
              placeholder="Ex : jambes, cardio"
              onChange={(value) => onChange('bodyZones', value)}
            />
          </div>
        </div>
      ) : null}

      {detailMode === 'bike' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={details.exercises ?? ''}
            placeholder="Ex : sortie endurance, travail en côte, vélocité..."
            onChange={(value) => onChange('exercises', value)}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <NumberDetailField
              label="Distance en km"
              value={details.distance}
              placeholder="Ex : 40"
              onChange={(value) => onChange('distance', value)}
            />

            <TextField
              label="Vitesse / rythme"
              value={details.pace ?? ''}
              placeholder="Ex : 25 km/h"
              onChange={(value) => onChange('pace', value)}
            />

            <NumberDetailField
              label="Dénivelé en mètres"
              value={details.elevation}
              placeholder="Ex : 500"
              onChange={(value) => onChange('elevation', value)}
            />

            <TextField
              label="Zones travaillées"
              value={details.bodyZones ?? ''}
              placeholder="Ex : jambes, cardio"
              onChange={(value) => onChange('bodyZones', value)}
            />
          </div>
        </div>
      ) : null}

      {detailMode === 'swim' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={details.exercises ?? ''}
            placeholder="Ex : échauffement, séries, récupération..."
            onChange={(value) => onChange('exercises', value)}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <NumberDetailField
              label="Distance en mètres"
              value={details.distance}
              placeholder="Ex : 1000"
              onChange={(value) => onChange('distance', value)}
            />

            <TextField
              label="Type de nage"
              value={details.swimmingStyle ?? ''}
              placeholder="Ex : crawl, brasse, dos"
              onChange={(value) => onChange('swimmingStyle', value)}
            />

            <TextField
              label="Allure / rythme"
              value={details.pace ?? ''}
              placeholder="Ex : 2:00/100m"
              onChange={(value) => onChange('pace', value)}
            />

            <TextField
              label="Zones travaillées"
              value={details.bodyZones ?? ''}
              placeholder="Ex : épaules, dos, cardio"
              onChange={(value) => onChange('bodyZones', value)}
            />
          </div>
        </div>
      ) : null}

      {detailMode === 'mobility' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={details.exercises ?? ''}
            placeholder="Ex : mobilité hanches, gainage, étirements..."
            onChange={(value) => onChange('exercises', value)}
          />

          <TextField
            label="Zones travaillées"
            value={details.bodyZones ?? ''}
            placeholder="Ex : dos, hanches, épaules"
            onChange={(value) => onChange('bodyZones', value)}
          />
        </div>
      ) : null}

      {detailMode === 'climb' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={details.exercises ?? ''}
            placeholder="Ex : bloc, voies, travail de doigts, gainage..."
            onChange={(value) => onChange('exercises', value)}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <NumberDetailField
              label="Volume / dénivelé"
              value={details.elevation}
              placeholder="Ex : 300"
              onChange={(value) => onChange('elevation', value)}
            />

            <TextField
              label="Zones travaillées"
              value={details.bodyZones ?? ''}
              placeholder="Ex : avant-bras, dos, gainage"
              onChange={(value) => onChange('bodyZones', value)}
            />
          </div>
        </div>
      ) : null}

      {detailMode === 'simple' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Détails de la séance"
            value={details.exercises ?? ''}
            placeholder="Ex : type d’activité, objectif, sensations..."
            onChange={(value) => onChange('exercises', value)}
          />

          <TextField
            label="Zones travaillées"
            value={details.bodyZones ?? ''}
            placeholder="Ex : cardio, jambes, haut du corps"
            onChange={(value) => onChange('bodyZones', value)}
          />
        </div>
      ) : null}
    </section>
  )
}

type StrengthExercisesEditorProps = {
  exercises: StrengthExercise[]
  onChange: (exercises: StrengthExercise[]) => void
  workouts: Workout[]
}

type StrengthExerciseField = keyof Omit<StrengthExercise, 'id'>

const strengthExerciseFieldOrder: StrengthExerciseField[] = [
  'name',
  'sets',
  'reps',
  'weight',
  'rest',
  'notes',
]

function StrengthExercisesEditor({
  exercises,
  onChange,
  workouts,
}: StrengthExercisesEditorProps) {
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const getFieldKey = (exerciseId: string, field: StrengthExerciseField) => {
    return `${exerciseId}-${field}`
  }

  const focusField = (exerciseId: string, field: StrengthExerciseField) => {
    setTimeout(() => {
      const input = fieldRefs.current[getFieldKey(exerciseId, field)]

      if (!input) {
        return
      }

      input.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      input.focus()
      input.select()
    }, 60)
  }

  const addExercise = () => {
    const newExercise = createEmptyStrengthExercise()

    onChange([...exercises, newExercise])
    focusField(newExercise.id, 'name')
  }

  const duplicateExercise = (exercise: StrengthExercise) => {
    const duplicatedExercise: StrengthExercise = {
      ...exercise,
      id: createId(),
      name: exercise.name ? `${exercise.name} copie` : '',
    }

    const exerciseIndex = exercises.findIndex((item) => {
      return item.id === exercise.id
    })

    const nextExercises = [...exercises]
    nextExercises.splice(exerciseIndex + 1, 0, duplicatedExercise)

    onChange(nextExercises)
    focusField(duplicatedExercise.id, 'name')
  }

  const removeExercise = (exerciseId: string) => {
    onChange(
      exercises.filter((exercise) => {
        return exercise.id !== exerciseId
      }),
    )
  }

  const updateExercise = (
    exerciseId: string,
    field: StrengthExerciseField,
    value: string,
  ) => {
    const nextExercises = exercises.map((exercise) => {
      if (exercise.id !== exerciseId) {
        return exercise
      }

      return {
        ...exercise,
        [field]: value,
      }
    })

    onChange(nextExercises)
  }

  const handleFieldKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    exercise: StrengthExercise,
    field: StrengthExerciseField,
  ) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()

    const currentFieldIndex = strengthExerciseFieldOrder.indexOf(field)
    const nextField = strengthExerciseFieldOrder[currentFieldIndex + 1]

    if (nextField) {
      focusField(exercise.id, nextField)
      return
    }

    addExercise()
  }

  return (
    <div>
      <datalist id="exercise-library">
        {EXERCISE_NAMES.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <div>
        <h3 className="text-2xl font-black text-white">
          Exercices de musculation
        </h3>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Ajoute chaque exercice séparément pour garder une séance claire :
          développé couché, développé militaire, dips, extensions triceps...
        </p>
      </div>

      {exercises.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
          <p className="text-4xl">🏋️</p>

          <p className="mt-4 text-2xl font-black text-white">
            Aucun exercice ajouté.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Pour une séance PUSH, ajoute par exemple développé couché,
            développé militaire, dips ou extensions triceps.
          </p>

          <button
            type="button"
            onClick={addExercise}
            className="mt-6 rounded-full bg-azur-400 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-azur-300"
          >
            + Ajouter mon premier exercice
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {exercises.map((exercise, index) => (
            <article
              key={exercise.id}
              className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-azur-300">
                    Exercice {index + 1}
                  </p>

                  <h4 className="mt-2 text-2xl font-black text-white">
                    {exercise.name.trim() || 'Nouvel exercice'}
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => duplicateExercise(exercise)}
                    className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-black text-sky-200 transition hover:bg-sky-400/20"
                  >
                    Dupliquer
                  </button>

                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.id)}
                    className="rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-black text-red-200 transition hover:bg-red-400/20"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {(() => {
                const last = getLastPerformance(workouts, exercise.name)
                if (!last) return null
                return (
                  <div className="mt-4 rounded-2xl border border-azur-400/20 bg-azur-400/10 px-4 py-3 text-sm">
                    <span className="font-black text-azur-200">
                      Dernière fois
                    </span>{' '}
                    <span className="text-slate-300">
                      ({new Date(last.date).toLocaleDateString('fr-FR')})
                    </span>{' '}
                    <span className="font-bold text-white">
                      {formatLastPerformance(last)}
                    </span>
                    {last.oneRepMax ? (
                      <span className="text-slate-300">
                        {' '}
                        · 1RM ≈{' '}
                        <span className="font-bold text-white">
                          {last.oneRepMax} kg
                        </span>
                      </span>
                    ) : null}
                    <span className="mt-1 block font-black text-azur-300">
                      {getOverloadSuggestion(last)}
                    </span>
                  </div>
                )
              })()}

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-4">
                <ExerciseTextField
                  label="Nom de l’exercice"
                  value={exercise.name}
                  placeholder="Ex : Développé couché"
                  list="exercise-library"
                  inputRef={(node) => {
                    fieldRefs.current[getFieldKey(exercise.id, 'name')] = node
                  }}
                  onChange={(value) =>
                    updateExercise(exercise.id, 'name', value)
                  }
                  onKeyDown={(event) =>
                    handleFieldKeyDown(event, exercise, 'name')
                  }
                />

                <ExerciseTextField
                  label="Séries"
                  value={exercise.sets}
                  placeholder="Ex : 3"
                  inputRef={(node) => {
                    fieldRefs.current[getFieldKey(exercise.id, 'sets')] = node
                  }}
                  onChange={(value) =>
                    updateExercise(exercise.id, 'sets', value)
                  }
                  onKeyDown={(event) =>
                    handleFieldKeyDown(event, exercise, 'sets')
                  }
                />

                <ExerciseTextField
                  label="Répétitions"
                  value={exercise.reps}
                  placeholder="Ex : 5 ou 8-10"
                  inputRef={(node) => {
                    fieldRefs.current[getFieldKey(exercise.id, 'reps')] = node
                  }}
                  onChange={(value) =>
                    updateExercise(exercise.id, 'reps', value)
                  }
                  onKeyDown={(event) =>
                    handleFieldKeyDown(event, exercise, 'reps')
                  }
                />

                <ExerciseTextField
                  label="Charge"
                  value={exercise.weight}
                  placeholder="Ex : 70 kg"
                  inputRef={(node) => {
                    fieldRefs.current[getFieldKey(exercise.id, 'weight')] = node
                  }}
                  onChange={(value) =>
                    updateExercise(exercise.id, 'weight', value)
                  }
                  onKeyDown={(event) =>
                    handleFieldKeyDown(event, exercise, 'weight')
                  }
                />

                <ExerciseTextField
                  label="Repos"
                  value={exercise.rest}
                  placeholder="Ex : 2 min"
                  inputRef={(node) => {
                    fieldRefs.current[getFieldKey(exercise.id, 'rest')] = node
                  }}
                  onChange={(value) =>
                    updateExercise(exercise.id, 'rest', value)
                  }
                  onKeyDown={(event) =>
                    handleFieldKeyDown(event, exercise, 'rest')
                  }
                />

                <div className="md:col-span-3">
                  <ExerciseTextField
                    label="Note sur cet exercice"
                    value={exercise.notes}
                    placeholder="Ex : dernière série difficile, bonne amplitude..."
                    inputRef={(node) => {
                      fieldRefs.current[getFieldKey(exercise.id, 'notes')] =
                        node
                    }}
                    onChange={(value) =>
                      updateExercise(exercise.id, 'notes', value)
                    }
                    onKeyDown={(event) =>
                      handleFieldKeyDown(event, exercise, 'notes')
                    }
                  />
                </div>
              </div>
            </article>
          ))}

          <button
            type="button"
            onClick={addExercise}
            className="w-full rounded-[2rem] border border-dashed border-azur-400/30 bg-azur-400/10 px-6 py-5 text-sm font-black text-azur-200 transition hover:bg-azur-400/20"
          >
            + Ajouter un exercice
          </button>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Astuce : appuie sur Entrée pour passer au champ suivant. Depuis le
        dernier champ, Entrée ajoute automatiquement un nouvel exercice.
      </p>
    </div>
  )
}

type ExerciseTextFieldProps = {
  label: string
  value: string
  placeholder: string
  inputRef: (node: HTMLInputElement | null) => void
  onChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  list?: string
}

function ExerciseTextField({
  label,
  value,
  placeholder,
  inputRef,
  onChange,
  onKeyDown,
  list,
}: ExerciseTextFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-200">{label}</span>

      <input
        ref={inputRef}
        value={value}
        list={list}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/60"
      />
    </label>
  )
}

type TextFieldProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-200">{label}</span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/60"
      />
    </label>
  )
}

type TextAreaFieldProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
}: TextAreaFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-200">{label}</span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/60"
      />
    </label>
  )
}

type NumberDetailFieldProps = {
  label: string
  value?: number
  placeholder: string
  onChange: (value: number | undefined) => void
}

function NumberDetailField({
  label,
  value,
  placeholder,
  onChange,
}: NumberDetailFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-200">{label}</span>

      <input
        type="number"
        min="0"
        value={value ?? ''}
        onChange={(event) => {
          const newValue = event.target.value

          onChange(newValue === '' ? undefined : Number(newValue))
        }}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/60"
      />
    </label>
  )
}

function cleanWorkoutDetails(
  category: SportCategoryId,
  details: WorkoutDetails,
): WorkoutDetails | undefined {
  const detailMode = getDetailMode(category)
  const cleanedDetails: WorkoutDetails = {}

  const cleanedExercises = details.exercises?.trim()
  const cleanedPace = details.pace?.trim()
  const cleanedSwimmingStyle = details.swimmingStyle?.trim()
  const cleanedBodyZones = details.bodyZones?.trim()

  if (detailMode === 'strength') {
    if (cleanedBodyZones) {
      cleanedDetails.bodyZones = cleanedBodyZones
    }

    const cleanedStrengthExercises = (details.strengthExercises ?? [])
      .map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
        sets: exercise.sets.trim(),
        reps: exercise.reps.trim(),
        weight: exercise.weight.trim(),
        rest: exercise.rest.trim(),
        notes: exercise.notes.trim(),
      }))
      .filter((exercise) => {
        return (
          exercise.name ||
          exercise.sets ||
          exercise.reps ||
          exercise.weight ||
          exercise.rest ||
          exercise.notes
        )
      })

    if (cleanedStrengthExercises.length > 0) {
      cleanedDetails.strengthExercises = cleanedStrengthExercises
    }

    return hasWorkoutDetails(cleanedDetails) ? cleanedDetails : undefined
  }

  if (detailMode === 'endurance' || detailMode === 'bike') {
    if (cleanedExercises) cleanedDetails.exercises = cleanedExercises
    if (typeof details.distance === 'number' && details.distance > 0) {
      cleanedDetails.distance = details.distance
    }
    if (cleanedPace) cleanedDetails.pace = cleanedPace
    if (typeof details.elevation === 'number' && details.elevation > 0) {
      cleanedDetails.elevation = details.elevation
    }
    if (cleanedBodyZones) cleanedDetails.bodyZones = cleanedBodyZones

    return hasWorkoutDetails(cleanedDetails) ? cleanedDetails : undefined
  }

  if (detailMode === 'swim') {
    if (cleanedExercises) cleanedDetails.exercises = cleanedExercises
    if (typeof details.distance === 'number' && details.distance > 0) {
      cleanedDetails.distance = details.distance
    }
    if (cleanedSwimmingStyle) {
      cleanedDetails.swimmingStyle = cleanedSwimmingStyle
    }
    if (cleanedPace) cleanedDetails.pace = cleanedPace
    if (cleanedBodyZones) cleanedDetails.bodyZones = cleanedBodyZones

    return hasWorkoutDetails(cleanedDetails) ? cleanedDetails : undefined
  }

  if (detailMode === 'mobility' || detailMode === 'simple') {
    if (cleanedExercises) cleanedDetails.exercises = cleanedExercises
    if (cleanedBodyZones) cleanedDetails.bodyZones = cleanedBodyZones

    return hasWorkoutDetails(cleanedDetails) ? cleanedDetails : undefined
  }

  if (detailMode === 'climb') {
    if (cleanedExercises) cleanedDetails.exercises = cleanedExercises
    if (typeof details.elevation === 'number' && details.elevation > 0) {
      cleanedDetails.elevation = details.elevation
    }
    if (cleanedBodyZones) cleanedDetails.bodyZones = cleanedBodyZones

    return hasWorkoutDetails(cleanedDetails) ? cleanedDetails : undefined
  }

  return hasWorkoutDetails(cleanedDetails) ? cleanedDetails : undefined
}

function hasWorkoutDetails(details: WorkoutDetails) {
  return Object.values(details).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0
    }

    return value !== undefined && value !== null && value !== ''
  })
}