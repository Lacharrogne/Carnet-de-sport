import type { ReactNode } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { StrengthExercise, Workout } from '../types/workout'

type WorkoutCardProps = {
  workout: Workout
  onOpen?: (workoutId: string) => void
  onEdit?: (workoutId: string) => void
  onDelete?: (workoutId: string) => void | Promise<void>
}

const trendConfig: Record<
  Workout['trend'],
  {
    icon: string
    label: string
    className: string
  }
> = {
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
  onOpen,
  onEdit,
  onDelete,
}: WorkoutCardProps) {
  const category = SPORT_CATEGORIES.find((item) => {
    return item.id === workout.category
  })

  const trend = trendConfig[workout.trend]

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${workout.date}T00:00:00`))

  const hasActions = Boolean(onEdit || onDelete)

  const handleOpen = () => {
    if (!onOpen) {
      return
    }

    onOpen(workout.id)
  }

  return (
    <article
      className={`group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-emerald-400/25 hover:bg-white/[0.07] ${
        onOpen ? 'cursor-pointer' : ''
      }`}
      onClick={handleOpen}
    >
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
              <div
                className="flex items-center gap-2"
                onClick={(event) => event.stopPropagation()}
              >
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

              <p className="mt-2 line-clamp-4 text-sm leading-7 text-slate-300">
                {workout.notes}
              </p>
            </div>
          ) : null}

          {workout.improvementIdea ? (
            <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                À améliorer
              </p>

              <p className="mt-2 line-clamp-4 text-sm leading-7 text-slate-200">
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

          {onOpen ? (
            <div className="mt-auto pt-1">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-black text-slate-300 transition group-hover:border-emerald-400/25 group-hover:text-emerald-200">
                Voir le détail de la séance →
              </div>
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

  if (items.length === 0 && !hasStrengthExercises) {
    return null
  }

  return (
    <div className="mt-5 space-y-4">
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
        <StrengthExercisesPreview exercises={strengthExercises} />
      ) : null}
    </div>
  )
}

function StrengthExercisesPreview({
  exercises,
}: {
  exercises: StrengthExercise[]
}) {
  const visibleExercises = exercises.slice(0, 4)
  const hiddenExercisesCount = exercises.length - visibleExercises.length
  const totalVolume = exercises.reduce((total, exercise) => {
    return total + getExerciseVolume(exercise)
  }, 0)

  return (
    <section className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Détail musculation
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
          </p>
        </div>

        {totalVolume > 0 ? (
          <div className="rounded-full border border-emerald-400/20 bg-slate-950/60 px-3 py-1.5 text-xs font-black text-emerald-200">
            {formatNumber(totalVolume)} kg
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {visibleExercises.map((exercise) => (
          <StrengthExercisePreviewItem
            key={exercise.id}
            exercise={exercise}
          />
        ))}
      </div>

      {hiddenExercisesCount > 0 ? (
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-center text-sm font-black text-slate-300">
          + {hiddenExercisesCount} autre
          {hiddenExercisesCount > 1 ? 's' : ''} exercice
          {hiddenExercisesCount > 1 ? 's' : ''}
        </div>
      ) : null}
    </section>
  )
}

function StrengthExercisePreviewItem({
  exercise,
}: {
  exercise: StrengthExercise
}) {
  const volume = getExerciseVolume(exercise)

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate font-black text-white">
            {exercise.name || 'Exercice sans nom'}
          </h4>

          {exercise.notes ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
              {exercise.notes}
            </p>
          ) : null}
        </div>

        {volume > 0 ? (
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-black text-emerald-200">
            {formatNumber(volume)} kg
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {exercise.sets ? (
          <MiniStat label="Séries" value={exercise.sets} />
        ) : null}

        {exercise.reps ? (
          <MiniStat label="Reps" value={exercise.reps} />
        ) : null}

        {exercise.weight ? (
          <MiniStat label="Charge" value={formatWeight(exercise.weight)} />
        ) : null}

        {exercise.rest ? (
          <MiniStat label="Repos" value={formatRest(exercise.rest)} />
        ) : null}
      </div>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-bold text-slate-300">
      <span className="text-slate-500">{label} :</span> {value}
    </span>
  )
}

function getExerciseVolume(exercise: StrengthExercise) {
  const sets = parseStrengthNumber(exercise.sets)
  const reps = parseStrengthNumber(exercise.reps)
  const weight = parseStrengthNumber(exercise.weight)

  if (!sets || !reps || !weight) {
    return 0
  }

  return sets * reps * weight
}

function parseStrengthNumber(value: string) {
  const cleanedValue = value
    .replace(',', '.')
    .replace(/[^\d.-]/g, '')
    .trim()

  const number = Number(cleanedValue)

  if (Number.isNaN(number)) {
    return 0
  }

  return number
}

function formatWeight(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return '—'
  }

  const lowerValue = trimmedValue.toLowerCase()

  if (
    lowerValue.includes('kg') ||
    lowerValue.includes('pdc') ||
    lowerValue.includes('poids')
  ) {
    return trimmedValue
  }

  return `${trimmedValue} kg`
}

function formatRest(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return '—'
  }

  const lowerValue = trimmedValue.toLowerCase()

  if (
    lowerValue.includes('s') ||
    lowerValue.includes('min') ||
    lowerValue.includes('mn')
  ) {
    return trimmedValue
  }

  return `${trimmedValue} min`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value)
}

function formatLabel(value: string) {
  return value
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/^\p{L}/u, (letter) => letter.toUpperCase())
}