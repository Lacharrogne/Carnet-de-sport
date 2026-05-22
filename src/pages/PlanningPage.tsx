import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type {
  SportCategoryId,
  StrengthExercise,
  WorkoutDetails,
} from '../types/workout'

import { getSportDetailMode } from '../utils/sportDetails'

type PlanningPageProps = {
  plannedWorkouts: PlannedWorkout[]
  onAddPlannedWorkout: (plannedWorkout: PlannedWorkout) => void | Promise<void>
  onUpdatePlannedWorkout: (plannedWorkout: PlannedWorkout) => void | Promise<void>
  onDeletePlannedWorkout: (plannedWorkoutId: string) => void | Promise<void>
  onCompletePlannedWorkout: (plannedWorkout: PlannedWorkout) => void | Promise<void>
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

export default function PlanningPage({
  plannedWorkouts,
  onAddPlannedWorkout,
  onUpdatePlannedWorkout,
  onDeletePlannedWorkout,
  onCompletePlannedWorkout,
}: PlanningPageProps) {
  const today = getTodayDateKey()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SportCategoryId>('musculation')
  const [date, setDate] = useState(today)
  const [duration, setDuration] = useState('')
  const [objective, setObjective] = useState('')

  const [exercises, setExercises] = useState('')
  const [distance, setDistance] = useState('')
  const [pace, setPace] = useState('')
  const [swimmingStyle, setSwimmingStyle] = useState('')
  const [elevation, setElevation] = useState('')
  const [bodyZones, setBodyZones] = useState('')
  const [strengthExercises, setStrengthExercises] = useState<StrengthExercise[]>(
    [],
  )

  const [editingPlannedWorkoutId, setEditingPlannedWorkoutId] = useState<
    string | null
  >(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = editingPlannedWorkoutId !== null

  const sortedPlannedWorkouts = useMemo(() => {
    return [...plannedWorkouts].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }, [plannedWorkouts])

  const nextWorkout = useMemo(() => {
    return sortedPlannedWorkouts.find((plannedWorkout) => {
      return plannedWorkout.date >= today
    })
  }, [sortedPlannedWorkouts, today])

  const upcomingWorkoutsCount = useMemo(() => {
    return plannedWorkouts.filter((plannedWorkout) => {
      return plannedWorkout.date >= today
    }).length
  }, [plannedWorkouts, today])

  const overdueWorkoutsCount = useMemo(() => {
    return plannedWorkouts.filter((plannedWorkout) => {
      return plannedWorkout.date < today
    }).length
  }, [plannedWorkouts, today])

  const totalPlannedDuration = useMemo(() => {
    return plannedWorkouts.reduce((total, plannedWorkout) => {
      return total + plannedWorkout.duration
    }, 0)
  }, [plannedWorkouts])

  const resetDetailsFields = () => {
    setExercises('')
    setDistance('')
    setPace('')
    setSwimmingStyle('')
    setElevation('')
    setBodyZones('')
    setStrengthExercises([])
  }

  const resetForm = () => {
    setTitle('')
    setCategory('musculation')
    setDate(today)
    setDuration('')
    setObjective('')
    resetDetailsFields()
    setEditingPlannedWorkoutId(null)
  }

  const handleCategoryChange = (newCategory: SportCategoryId) => {
    setCategory(newCategory)
    resetDetailsFields()
  }

  const handleEditClick = (plannedWorkout: PlannedWorkout) => {
    const details = plannedWorkout.details

    setEditingPlannedWorkoutId(plannedWorkout.id)
    setTitle(plannedWorkout.title)
    setCategory(plannedWorkout.category)
    setDate(plannedWorkout.date)
    setDuration(String(plannedWorkout.duration))
    setObjective(plannedWorkout.objective ?? '')

    setExercises(details?.exercises ?? '')
    setDistance(formatOptionalValue(details?.distance))
    setPace(details?.pace ?? '')
    setSwimmingStyle(details?.swimmingStyle ?? '')
    setElevation(formatOptionalValue(details?.elevation))
    setBodyZones(details?.bodyZones ?? '')
    setStrengthExercises(normalizeStrengthExercises(details?.strengthExercises))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const cleanedTitle = title.trim()
    const cleanedDuration = Number(duration)
    const cleanedObjective = objective.trim()

    if (!cleanedTitle) {
      window.alert('Donne un nom à ta séance prévue.')
      return
    }

    if (!date) {
      window.alert('Choisis une date pour ta séance prévue.')
      return
    }

    if (!duration || Number.isNaN(cleanedDuration) || cleanedDuration <= 0) {
      window.alert('Ajoute une durée valide.')
      return
    }

    const details = buildWorkoutDetails({
      category,
      exercises,
      distance,
      pace,
      swimmingStyle,
      elevation,
      bodyZones,
      strengthExercises,
    })

    const plannedWorkoutToSave: PlannedWorkout = {
      id: editingPlannedWorkoutId ?? createId(),
      title: cleanedTitle,
      category,
      date,
      duration: cleanedDuration,
      objective: cleanedObjective,
      ...(details ? { details } : {}),
    }

    setIsSubmitting(true)

    try {
      if (isEditing) {
        await onUpdatePlannedWorkout(plannedWorkoutToSave)
      } else {
        await onAddPlannedWorkout(plannedWorkoutToSave)
      }

      resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Planning
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                Prépare tes prochaines séances.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Planifie tes entraînements à l’avance pour transformer ton sport
                en routine claire et motivante.
              </p>
            </div>

            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Prochaine séance
              </p>

              {nextWorkout ? (
                <>
                  <p className="mt-4 text-3xl font-black text-white">
                    {nextWorkout.title}
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    {formatDate(nextWorkout.date)} ·{' '}
                    {formatDuration(nextWorkout.duration)}
                  </p>

                  {getPlannedWorkoutDetailItems(nextWorkout).length > 0 ? (
                    <p className="mt-4 inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-black text-sky-200">
                      Séance déjà détaillée
                    </p>
                  ) : (
                    <p className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-300">
                      À détailler
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="mt-4 text-3xl font-black text-white">
                    Rien de prévu
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    Ajoute une séance pour garder le rythme.
                  </p>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard
            label="Séances prévues"
            value={plannedWorkouts.length.toString()}
          />

          <StatCard label="À venir" value={upcomingWorkoutsCount.toString()} />

          <StatCard
            label="À rattraper"
            value={overdueWorkoutsCount.toString()}
          />

          <StatCard
            label="Temps prévu"
            value={formatDuration(totalPlannedDuration)}
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form
            onSubmit={handleSubmit}
            className={`rounded-[2rem] border p-6 transition ${
              isEditing
                ? 'border-sky-400/30 bg-sky-400/10'
                : 'border-white/10 bg-white/[0.04]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                  {isEditing ? 'Modifier la séance' : 'Nouvelle séance prévue'}
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {isEditing
                    ? 'Ajuste ton programme.'
                    : 'Crée ton prochain objectif.'}
                </h2>
              </div>

              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-slate-200 transition hover:bg-white/10"
                >
                  Annuler
                </button>
              ) : null}
            </div>

            <div className="mt-6 space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-200">
                  Nom de la séance
                </span>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex : Séance jambes, footing, natation..."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-200">Sport</span>

                <select
                  value={category}
                  onChange={(event) =>
                    handleCategoryChange(event.target.value as SportCategoryId)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
                >
                  {SPORT_CATEGORIES.map((sportCategory) => (
                    <option key={sportCategory.id} value={sportCategory.id}>
                      {sportCategory.emoji} {sportCategory.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">Date</span>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">
                    Durée prévue
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    placeholder="Ex : 45"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-200">
                  Objectif de la séance
                </span>

                <textarea
                  value={objective}
                  onChange={(event) => setObjective(event.target.value)}
                  rows={4}
                  placeholder="Ex : Travailler les jambes, courir sans m’arrêter, améliorer mon cardio..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
                />
              </label>

              <SportSpecificFields
                category={category}
                exercises={exercises}
                distance={distance}
                pace={pace}
                swimmingStyle={swimmingStyle}
                elevation={elevation}
                bodyZones={bodyZones}
                strengthExercises={strengthExercises}
                onExercisesChange={setExercises}
                onDistanceChange={setDistance}
                onPaceChange={setPace}
                onSwimmingStyleChange={setSwimmingStyle}
                onElevationChange={setElevation}
                onBodyZonesChange={setBodyZones}
                onStrengthExercisesChange={setStrengthExercises}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Sauvegarde en cours...'
                  : isEditing
                    ? 'Enregistrer les modifications'
                    : '+ Ajouter au planning'}
              </button>
            </div>
          </form>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                  Séances à venir
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Ton programme.
                </h2>
              </div>

              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
                <p className="text-sm text-emerald-300">Total prévu</p>

                <p className="mt-1 text-2xl font-black text-white">
                  {plannedWorkouts.length}
                </p>
              </div>
            </div>

            {sortedPlannedWorkouts.length > 0 ? (
              <div className="mt-6 space-y-4">
                {sortedPlannedWorkouts.map((plannedWorkout) => (
                  <PlannedWorkoutCard
                    key={plannedWorkout.id}
                    plannedWorkout={plannedWorkout}
                    isOverdue={plannedWorkout.date < today}
                    isEditing={plannedWorkout.id === editingPlannedWorkoutId}
                    onEdit={() => handleEditClick(plannedWorkout)}
                    onDelete={() => onDeletePlannedWorkout(plannedWorkout.id)}
                    onComplete={() => onCompletePlannedWorkout(plannedWorkout)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-8 text-center">
                <p className="text-5xl">📅</p>

                <h3 className="mt-4 text-2xl font-black text-white">
                  Aucune séance prévue.
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Planifie une séance pour garder une direction claire.
                </p>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}

function SportSpecificFields({
  category,
  exercises,
  distance,
  pace,
  swimmingStyle,
  elevation,
  bodyZones,
  strengthExercises,
  onExercisesChange,
  onDistanceChange,
  onPaceChange,
  onSwimmingStyleChange,
  onElevationChange,
  onBodyZonesChange,
  onStrengthExercisesChange,
}: {
  category: SportCategoryId
  exercises: string
  distance: string
  pace: string
  swimmingStyle: string
  elevation: string
  bodyZones: string
  strengthExercises: StrengthExercise[]
  onExercisesChange: (value: string) => void
  onDistanceChange: (value: string) => void
  onPaceChange: (value: string) => void
  onSwimmingStyleChange: (value: string) => void
  onElevationChange: (value: string) => void
  onBodyZonesChange: (value: string) => void
  onStrengthExercisesChange: (exercises: StrengthExercise[]) => void
}) {
const detailMode = getSportDetailMode(category)

  return (
    <section className="rounded-[2rem] border border-emerald-400/10 bg-emerald-400/5 p-5">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
        Détails préparés
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Prépare la séance maintenant pour ne plus avoir à tout détailler au
        moment de la validation.
      </p>

      {detailMode === 'strength' ? (
        <div className="mt-5 space-y-5">
          <TextField
            label="Zones travaillées"
            value={bodyZones}
            placeholder="Ex : pectoraux, triceps, épaules"
            onChange={onBodyZonesChange}
          />

          <StrengthExercisesEditor
            exercises={strengthExercises}
            onChange={onStrengthExercisesChange}
          />
        </div>
      ) : null}

      {detailMode === 'endurance' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={exercises}
            placeholder="Ex : échauffement, fractionné, retour au calme..."
            onChange={onExercisesChange}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              type="number"
              label="Distance en km"
              value={distance}
              placeholder="Ex : 5"
              onChange={onDistanceChange}
            />

            <TextField
              label="Allure"
              value={pace}
              placeholder="Ex : 6:20/km"
              onChange={onPaceChange}
            />

            <TextField
              type="number"
              label="Dénivelé en mètres"
              value={elevation}
              placeholder="Ex : 250"
              onChange={onElevationChange}
            />

            <TextField
              label="Zones travaillées"
              value={bodyZones}
              placeholder="Ex : jambes, cardio"
              onChange={onBodyZonesChange}
            />
          </div>
        </div>
      ) : null}

      {detailMode === 'bike' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={exercises}
            placeholder="Ex : sortie endurance, travail en côte, vélocité..."
            onChange={onExercisesChange}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              type="number"
              label="Distance en km"
              value={distance}
              placeholder="Ex : 40"
              onChange={onDistanceChange}
            />

            <TextField
              label="Vitesse / rythme"
              value={pace}
              placeholder="Ex : 25 km/h"
              onChange={onPaceChange}
            />

            <TextField
              type="number"
              label="Dénivelé en mètres"
              value={elevation}
              placeholder="Ex : 500"
              onChange={onElevationChange}
            />

            <TextField
              label="Zones travaillées"
              value={bodyZones}
              placeholder="Ex : jambes, cardio"
              onChange={onBodyZonesChange}
            />
          </div>
        </div>
      ) : null}

      {detailMode === 'swim' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={exercises}
            placeholder="Ex : échauffement, séries, récupération..."
            onChange={onExercisesChange}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              type="number"
              label="Distance en mètres"
              value={distance}
              placeholder="Ex : 1000"
              onChange={onDistanceChange}
            />

            <TextField
              label="Type de nage"
              value={swimmingStyle}
              placeholder="Ex : crawl, brasse, dos"
              onChange={onSwimmingStyleChange}
            />

            <TextField
              label="Allure / rythme"
              value={pace}
              placeholder="Ex : 2:00/100m"
              onChange={onPaceChange}
            />

            <TextField
              label="Zones travaillées"
              value={bodyZones}
              placeholder="Ex : épaules, dos, cardio"
              onChange={onBodyZonesChange}
            />
          </div>
        </div>
      ) : null}

      {detailMode === 'mobility' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={exercises}
            placeholder="Ex : mobilité hanches, gainage, étirements..."
            onChange={onExercisesChange}
          />

          <TextField
            label="Zones travaillées"
            value={bodyZones}
            placeholder="Ex : dos, hanches, épaules"
            onChange={onBodyZonesChange}
          />
        </div>
      ) : null}

      {detailMode === 'climb' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Programme prévu"
            value={exercises}
            placeholder="Ex : bloc, voies, travail de doigts, gainage..."
            onChange={onExercisesChange}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              type="number"
              label="Volume / dénivelé"
              value={elevation}
              placeholder="Ex : 300"
              onChange={onElevationChange}
            />

            <TextField
              label="Zones travaillées"
              value={bodyZones}
              placeholder="Ex : avant-bras, dos, gainage"
              onChange={onBodyZonesChange}
            />
          </div>
        </div>
      ) : null}

      {detailMode === 'simple' ? (
        <div className="mt-5 space-y-5">
          <TextAreaField
            label="Détails de la séance"
            value={exercises}
            placeholder="Ex : type d’activité, objectif, sensations..."
            onChange={onExercisesChange}
          />

          <TextField
            label="Zones travaillées"
            value={bodyZones}
            placeholder="Ex : cardio, jambes, haut du corps"
            onChange={onBodyZonesChange}
          />
        </div>
      ) : null}
    </section>
  )
}

function StrengthExercisesEditor({
  exercises,
  onChange,
}: {
  exercises: StrengthExercise[]
  onChange: (exercises: StrengthExercise[]) => void
}) {
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
      <div>
        <h3 className="text-2xl font-black text-white">
          Exercices de musculation
        </h3>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Ajoute chaque exercice séparément pour préparer une vraie séance :
          développé couché, squat, rowing, dips...
        </p>
      </div>

      {exercises.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
          <p className="text-4xl">🏋️</p>

          <p className="mt-4 text-2xl font-black text-white">
            Aucun exercice ajouté.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Ajoute ton premier exercice pour préparer la séance en détail.
          </p>

          <button
            type="button"
            onClick={addExercise}
            className="mt-6 rounded-full bg-emerald-400 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
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
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
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

              <div className="mt-6 grid gap-5 md:grid-cols-4">
                <ExerciseTextField
                  label="Nom de l’exercice"
                  value={exercise.name}
                  placeholder="Ex : Développé couché"
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
            className="w-full rounded-[2rem] border border-dashed border-emerald-400/30 bg-emerald-400/10 px-6 py-5 text-sm font-black text-emerald-200 transition hover:bg-emerald-400/20"
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

function PlannedWorkoutCard({
  plannedWorkout,
  isOverdue,
  isEditing,
  onEdit,
  onDelete,
  onComplete,
}: {
  plannedWorkout: PlannedWorkout
  isOverdue: boolean
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void | Promise<void>
  onComplete: () => void | Promise<void>
}) {
  const sportCategory = SPORT_CATEGORIES.find((category) => {
    return category.id === plannedWorkout.category
  })

  const detailItems = getPlannedWorkoutDetailItems(plannedWorkout)
  const hasDetails = detailItems.length > 0

  return (
    <article
      className={`rounded-3xl border p-5 transition ${
        isEditing
          ? 'border-sky-400/40 bg-sky-400/10'
          : 'border-white/10 bg-slate-950/60'
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-400">
              {formatDate(plannedWorkout.date)}
            </p>

            {isEditing ? (
              <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-black text-sky-200">
                En modification
              </span>
            ) : isOverdue ? (
              <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-black text-red-200">
                À rattraper
              </span>
            ) : (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200">
                À venir
              </span>
            )}

            {hasDetails ? (
              <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-black text-sky-200">
                Détaillée
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-slate-400">
                À détailler
              </span>
            )}
          </div>

          <h3 className="mt-2 break-words text-2xl font-black text-white">
            {plannedWorkout.title}
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {sportCategory?.emoji ?? '🏃'} {sportCategory?.label ?? 'Sport'}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {formatDuration(plannedWorkout.duration)}
            </span>
          </div>

          {plannedWorkout.objective ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Objectif
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {plannedWorkout.objective}
              </p>
            </div>
          ) : null}

          {hasDetails ? (
            <div className="mt-4 rounded-2xl border border-sky-400/10 bg-sky-400/5 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                Détails préparés
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {detailItems.map((item, index) => (
                  <DetailPill
                    key={`${item.label}-${index}`}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-col">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-black text-sky-200 transition hover:bg-sky-400/20"
          >
            Modifier
          </button>

          <button
            type="button"
            onClick={() => {
              void onComplete()
            }}
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
          >
            Marquer réalisée
          </button>

          <button
            type="button"
            onClick={() => {
              void onDelete()
            }}
            className="rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-black text-red-200 transition hover:bg-red-400/20"
          >
            Supprimer
          </button>
        </div>
      </div>
    </article>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-xs font-bold text-slate-200">
      <span className="text-slate-500">{label} :</span> {value}
    </span>
  )
}

type TextFieldProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
  type = 'text',
}: TextFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-200">{label}</span>

      <input
        type={type}
        min={type === 'number' ? '0' : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-200">{label}</span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
      />
    </label>
  )
}

function ExerciseTextField({
  label,
  value,
  placeholder,
  inputRef,
  onChange,
  onKeyDown,
}: {
  label: string
  value: string
  placeholder: string
  inputRef: (node: HTMLInputElement | null) => void
  onChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-200">{label}</span>

      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
      />
    </label>
  )
}

function buildWorkoutDetails({
  category,
  exercises,
  distance,
  pace,
  swimmingStyle,
  elevation,
  bodyZones,
  strengthExercises,
}: {
  category: SportCategoryId
  exercises: string
  distance: string
  pace: string
  swimmingStyle: string
  elevation: string
  bodyZones: string
  strengthExercises: StrengthExercise[]
}): WorkoutDetails | undefined {
const detailMode = getSportDetailMode(category)
  const cleanedDetails: WorkoutDetails = {}

  const cleanedExercises = exercises.trim()
  const cleanedPace = pace.trim()
  const cleanedSwimmingStyle = swimmingStyle.trim()
  const cleanedBodyZones = bodyZones.trim()
  const cleanedDistance = parseOptionalNumber(distance)
  const cleanedElevation = parseOptionalNumber(elevation)

  if (detailMode === 'strength') {
    if (cleanedBodyZones) {
      cleanedDetails.bodyZones = cleanedBodyZones
    }

    const cleanedStrengthExercises = strengthExercises
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
    if (cleanedDistance) cleanedDetails.distance = cleanedDistance
    if (cleanedPace) cleanedDetails.pace = cleanedPace
    if (cleanedElevation) cleanedDetails.elevation = cleanedElevation
    if (cleanedBodyZones) cleanedDetails.bodyZones = cleanedBodyZones

    return hasWorkoutDetails(cleanedDetails) ? cleanedDetails : undefined
  }

  if (detailMode === 'swim') {
    if (cleanedExercises) cleanedDetails.exercises = cleanedExercises
    if (cleanedDistance) cleanedDetails.distance = cleanedDistance
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
    if (cleanedElevation) cleanedDetails.elevation = cleanedElevation
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

function getPlannedWorkoutDetailItems(plannedWorkout: PlannedWorkout) {
  const details = plannedWorkout.details

  if (!details) {
    return []
  }

  const category = String(plannedWorkout.category)
  const items: Array<{ label: string; value: string }> = []

  if (category === 'musculation') {
    const plannedExercises = details.strengthExercises ?? []
    const exerciseNames = plannedExercises
      .map((exercise) => exercise.name.trim())
      .filter(Boolean)

    if (plannedExercises.length > 0) {
      items.push({
        label: 'Exercices',
        value: `${plannedExercises.length}`,
      })
    }

    if (exerciseNames.length > 0) {
      const visibleNames = exerciseNames.slice(0, 3).join(', ')
      const hiddenCount = exerciseNames.length - 3

      items.push({
        label: 'Programme',
        value:
          hiddenCount > 0
            ? `${visibleNames} + ${hiddenCount}`
            : visibleNames,
      })
    }

    const totalVolume = getPlannedStrengthVolume(plannedExercises)

    if (totalVolume > 0) {
      items.push({
        label: 'Volume prévu',
        value: `${formatNumber(totalVolume)} kg`,
      })
    }

    if (details.bodyZones) {
      items.push({
        label: 'Zones',
        value: truncateText(details.bodyZones),
      })
    }

    return items.slice(0, 5)
  }

  if (details.distance) {
    items.push({
      label: 'Distance',
      value: `${details.distance} ${category === 'natation' ? 'm' : 'km'}`,
    })
  }

  if (details.pace) {
    items.push({
      label: category === 'velo' || category === 'vtt' ? 'Rythme' : 'Allure',
      value: details.pace,
    })
  }

  if (details.elevation) {
    items.push({
      label: category === 'escalade' ? 'Volume' : 'Dénivelé',
      value: `${details.elevation} m`,
    })
  }

  if (details.swimmingStyle) {
    items.push({
      label: 'Nage',
      value: details.swimmingStyle,
    })
  }

  if (details.bodyZones) {
    items.push({
      label: 'Zones',
      value: truncateText(details.bodyZones),
    })
  }

  if (details.exercises) {
    items.push({
      label: 'Programme',
      value: truncateText(details.exercises),
    })
  }

  return items.slice(0, 5)
}

function getPlannedStrengthVolume(exercises: StrengthExercise[] | undefined) {
  if (!exercises) {
    return 0
  }

  return exercises.reduce((total, exercise) => {
    return total + getPlannedExerciseVolume(exercise)
  }, 0)
}

function getPlannedExerciseVolume(exercise: StrengthExercise) {
  const sets = parseSportNumber(exercise.sets)
  const reps = parseSportNumber(exercise.reps)
  const weight = parseSportNumber(exercise.weight)

  if (!sets || !reps || !weight) {
    return 0
  }

  return sets * reps * weight
}

function normalizeStrengthExercises(
  exercises: StrengthExercise[] | undefined,
): StrengthExercise[] {
  if (!exercises) {
    return []
  }

  return exercises.map((exercise) => ({
    id: exercise.id ?? createId(),
    name: exercise.name ?? '',
    sets: exercise.sets ?? '',
    reps: exercise.reps ?? '',
    weight: exercise.weight ?? '',
    rest: exercise.rest ?? '',
    notes: exercise.notes ?? '',
  }))
}

function parseOptionalNumber(value: string) {
  const cleanedValue = value.trim().replace(',', '.')

  if (!cleanedValue) {
    return undefined
  }

  const number = Number(cleanedValue)

  if (Number.isNaN(number) || number <= 0) {
    return undefined
  }

  return number
}

function parseSportNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0
  }

  const normalizedValue = String(value).trim().replace(',', '.')
  const match = normalizedValue.match(/\d+(\.\d+)?/)

  if (!match) {
    return 0
  }

  return Number(match[0])
}

function formatOptionalValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function truncateText(value: string, maxLength = 80) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trim()}...`
}

function getTodayDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes} min`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value)
}