import type { ReactNode } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { StrengthExercise, Workout } from '../types/workout'

type WorkoutCardProps = {
  workout: Workout
  onEdit?: (workoutId: string) => void
  onDelete?: (workoutId: string) => void | Promise<void>
}

const trendConfig = {
  progress: {
    icon: '📈',
    label: 'Progression',
    className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  },
  stable: {
    icon: '⚖️',
    label: 'Stable',
    className: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  },
  regress: {
    icon: '📉',
    label: 'Régression',
    className: 'border-orange-400/20 bg-orange-400/10 text-orange-300',
  },
  record: {
    icon: '🔥',
    label: 'Record',
    className: 'border-red-400/20 bg-red-400/10 text-red-300',
  },
  first: {
    icon: '🌱',
    label: 'Première séance',
    className: 'border-lime-400/20 bg-lime-400/10 text-lime-300',
  },
}

export default function WorkoutCard({
  workout,
  onEdit,
  onDelete,
}: WorkoutCardProps) {
  const category = SPORT_CATEGORIES.find((item) => {
    return item.id === workout.category
  })

  const trend = trendConfig[workout.trend] ?? trendConfig.stable

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${workout.date}T00:00:00`))

  const hasActions = Boolean(onEdit || onDelete)

  return (
    <article className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-emerald-400/25 hover:bg-white/[0.07]">
      <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-emerald-400/10 opacity-0 blur-3xl transition group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold capitalize text-slate-400">
              {formattedDate}
            </p>

            <h3 className="mt-2 break-words text-2xl font-black leading-tight text-white">
              {workout.title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {hasActions ? (
              <div className="flex items-center gap-2">
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(workout.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sm font-black text-sky-300 transition hover:bg-sky-400/20"
                    aria-label="Modifier la séance"
                    title="Modifier"
                  >
                    ✎
                  </button>
                ) : null}

                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => void onDelete(workout.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-sm font-black text-red-300 transition hover:bg-red-400/20"
                    aria-label="Supprimer la séance"
                    title="Supprimer"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
              {category?.emoji ?? '✨'}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <InfoPill>{category?.label ?? 'Autre'}</InfoPill>
          <InfoPill>{workout.duration} min</InfoPill>
          <InfoPill>Intensité : {formatLabel(workout.intensity)}</InfoPill>
          <InfoPill>Ressenti : {formatLabel(workout.feeling)}</InfoPill>
        </div>

        <WorkoutDetailsList workout={workout} />

        <div
          className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${trend.className}`}
        >
          <span>{trend.icon}</span>
          <span>{trend.label}</span>
        </div>

        <div className="mt-5 flex flex-1 flex-col gap-4">
          {workout.notes ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Notes
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                {workout.notes}
              </p>
            </div>
          ) : null}

          {workout.improvementIdea ? (
            <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                À améliorer
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-200">
                {workout.improvementIdea}
              </p>
            </div>
          ) : null}

          {!workout.notes && !workout.improvementIdea ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-4">
              <p className="text-sm leading-6 text-slate-500">
                Aucune note ajoutée pour cette séance.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function InfoPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-bold text-slate-200">
      {children}
    </span>
  )
}

function WorkoutDetailsList({ workout }: { workout: Workout }) {
  const details = workout.details

  if (!details) {
    return null
  }

  const strengthExercises = details.strengthExercises ?? []
  const hasStrengthExercises = strengthExercises.length > 0

  const items = [
    !hasStrengthExercises && details.exercises
      ? `Exercices : ${details.exercises}`
      : null,
    !hasStrengthExercises && details.sets ? `${details.sets} séries` : null,
    !hasStrengthExercises && details.reps ? `${details.reps} reps` : null,
    !hasStrengthExercises && details.weight ? `${details.weight} kg` : null,
    details.distance
      ? `Distance : ${details.distance} ${
          workout.category === 'natation' ? 'm' : 'km'
        }`
      : null,
    details.pace ? `Allure : ${details.pace}` : null,
    details.swimmingStyle ? `Nage : ${details.swimmingStyle}` : null,
    details.position ? `Poste : ${details.position}` : null,
    details.goals !== undefined ? `Buts : ${details.goals}` : null,
    details.assists !== undefined ? `Passes : ${details.assists}` : null,
    details.elevation ? `Dénivelé : ${details.elevation} m` : null,
    details.bodyZones ? `Zones : ${details.bodyZones}` : null,
  ].filter((item): item is string => Boolean(item))

  return (
    <div className="mt-4 space-y-4">
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-bold text-sky-200"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {hasStrengthExercises ? (
        <StrengthExercisesList exercises={strengthExercises} />
      ) : null}
    </div>
  )
}

function StrengthExercisesList({
  exercises,
}: {
  exercises: StrengthExercise[]
}) {
  const totalSets = exercises.reduce((total, exercise) => {
    return total + parseNumber(exercise.sets)
  }, 0)

  const totalVolume = exercises.reduce((total, exercise) => {
    const sets = parseNumber(exercise.sets)
    const reps = parseNumber(exercise.reps)
    const weight = parseNumber(exercise.weight)

    return total + sets * reps * weight
  }, 0)

  return (
    <section className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Détail musculation
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {exercises.length} exercice{exercises.length > 1 ? 's' : ''} ·{' '}
            {totalSets} série{totalSets > 1 ? 's' : ''}
          </p>
        </div>

        {totalVolume > 0 ? (
          <div className="rounded-full border border-emerald-400/20 bg-slate-950/60 px-3 py-1.5 text-xs font-black text-emerald-200">
            Volume estimé : {Math.round(totalVolume)} kg
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {exercises.map((exercise) => (
          <StrengthExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </section>
  )
}

function StrengthExerciseCard({
  exercise,
}: {
  exercise: StrengthExercise
}) {
  const exerciseVolume =
    parseNumber(exercise.sets) *
    parseNumber(exercise.reps) *
    parseNumber(exercise.weight)

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-black text-white">
            {exercise.name.trim() || 'Exercice sans nom'}
          </h4>

          {exercise.notes.trim() ? (
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {exercise.notes}
            </p>
          ) : null}
        </div>

        {exerciseVolume > 0 ? (
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-200">
            {Math.round(exerciseVolume)} kg
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {exercise.sets.trim() ? (
          <DetailPill>{exercise.sets} série{parseNumber(exercise.sets) > 1 ? 's' : ''}</DetailPill>
        ) : null}

        {exercise.reps.trim() ? (
          <DetailPill>{exercise.reps} rep{parseNumber(exercise.reps) > 1 ? 's' : ''}</DetailPill>
        ) : null}

        {exercise.weight.trim() ? (
          <DetailPill>{formatValueWithUnit(exercise.weight, 'kg')}</DetailPill>
        ) : null}

        {exercise.rest.trim() ? (
          <DetailPill>Repos : {exercise.rest}</DetailPill>
        ) : null}
      </div>
    </article>
  )
}

function DetailPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300">
      {children}
    </span>
  )
}

function parseNumber(value: string) {
  const cleanedValue = value.replace(',', '.').replace(/[^\d.-]/g, '')
  const parsedValue = Number(cleanedValue)

  if (Number.isNaN(parsedValue)) {
    return 0
  }

  return parsedValue
}

function formatValueWithUnit(value: string, unit: string) {
  const cleanedValue = value.trim()

  if (!cleanedValue) {
    return ''
  }

  if (/[a-zA-Z]/.test(cleanedValue)) {
    return cleanedValue
  }

  return `${cleanedValue} ${unit}`
}

function formatLabel(value: string) {
  return value
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/^\p{L}/u, (letter) => letter.toUpperCase())
}