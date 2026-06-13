import type { ComponentType, ReactNode } from 'react'
import {
  ArrowRight,
  Flame,
  Minus,
  Pencil,
  Sprout,
  TrendingDown,
  TrendingUp,
  Trash2,
} from 'lucide-react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { StrengthExercise, Workout } from '../types/workout'

type WorkoutCardProps = {
  workout: Workout
  variant?: 'default' | 'compact'
  onOpen?: (workoutId: string) => void
  onEdit?: (workoutId: string) => void
  onDelete?: (workoutId: string) => void | Promise<void>
}

const trendConfig: Record<
  Workout['trend'],
  {
    icon: ComponentType<{ className?: string }>
    label: string
    className: string
  }
> = {
  progress: {
    icon: TrendingUp,
    label: 'Progression',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  stable: {
    icon: Minus,
    label: 'Stable',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  regress: {
    icon: TrendingDown,
    label: 'Régression',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  record: {
    icon: Flame,
    label: 'Record',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  first: {
    icon: Sprout,
    label: 'Première séance',
    className: 'border-lime-200 bg-lime-50 text-lime-700',
  },
}

export default function WorkoutCard({
  workout,
  variant = 'default',
  onOpen,
  onEdit,
  onDelete,
}: WorkoutCardProps) {
  const isCompact = variant === 'compact'

  const category = SPORT_CATEGORIES.find((item) => {
    return item.id === workout.category
  })

  const trend = trendConfig[workout.trend] ?? trendConfig.stable
  const TrendIcon = trend.icon

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
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
      className={[
        'group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md',
        isCompact ? 'p-4 sm:p-5' : 'p-5',
        onOpen ? 'cursor-pointer' : '',
      ].join(' ')}
      onClick={handleOpen}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {formattedDate}
          </p>

          <h3
            className={[
              'mt-1.5 line-clamp-2 break-words font-bold leading-tight text-slate-900',
              isCompact ? 'text-lg' : 'text-xl sm:text-2xl',
            ].join(' ')}
          >
            {workout.title}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isCompact && hasActions ? (
            <div
              className="flex items-center gap-2"
              onClick={(event) => event.stopPropagation()}
            >
              {onEdit ? (
                <button
                  type="button"
                  onClick={() => onEdit(workout.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-sky-50 hover:text-sky-600"
                  aria-label="Modifier la séance"
                  title="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              ) : null}

              {onDelete ? (
                <button
                  type="button"
                  onClick={() => void onDelete(workout.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Supprimer la séance"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl">
            {category?.emoji ?? '✨'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <InfoPill>{category?.label ?? 'Autre'}</InfoPill>
        <InfoPill>{formatDuration(workout.duration)}</InfoPill>
        <InfoPill>Intensité {formatLabel(workout.intensity)}</InfoPill>

        {!isCompact ? (
          <InfoPill>Ressenti {formatLabel(workout.feeling)}</InfoPill>
        ) : null}
      </div>

      <WorkoutDetailsList workout={workout} compact={isCompact} />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${trend.className}`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{trend.label}</span>
        </div>
      </div>

      {!isCompact && (workout.notes || workout.improvementIdea) ? (
        <div className="mt-4 grid gap-3">
          {workout.notes ? (
            <PreviewTextCard title="Notes">{workout.notes}</PreviewTextCard>
          ) : null}

          {workout.improvementIdea ? (
            <PreviewTextCard title="À améliorer" variant="emerald">
              {workout.improvementIdea}
            </PreviewTextCard>
          ) : null}
        </div>
      ) : null}

      {onOpen ? (
        <div className="mt-auto pt-5">
          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition group-hover:text-emerald-600">
            Voir le détail
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      ) : null}
    </article>
  )
}

function InfoPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  )
}

function PreviewTextCard({
  title,
  children,
  variant = 'default',
}: {
  title: string
  children: ReactNode
  variant?: 'default' | 'emerald'
}) {
  const className =
    variant === 'emerald'
      ? 'border-emerald-200 bg-emerald-50'
      : 'border-slate-200 bg-slate-50'

  const titleClassName =
    variant === 'emerald' ? 'text-emerald-700' : 'text-slate-400'

  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${titleClassName}`}
      >
        {title}
      </p>

      <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-slate-600">
        {children}
      </p>
    </div>
  )
}

function WorkoutDetailsList({
  workout,
  compact,
}: {
  workout: Workout
  compact: boolean
}) {
  const details = workout.details

  if (!details) {
    return null
  }

  const strengthExercises = details.strengthExercises ?? []
  const hasStrengthExercises = strengthExercises.length > 0

  if (hasStrengthExercises) {
    return (
      <div className="mt-4">
        <StrengthExercisesPreview
          exercises={strengthExercises}
          compact={compact}
        />
      </div>
    )
  }

  const items = [
    details.exercises ? `Exercices : ${details.exercises}` : null,
    details.sets ? `${details.sets} séries` : null,
    details.reps ? `${details.reps} reps` : null,
    details.weight ? `Charge : ${formatWeight(details.weight)}` : null,
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

  if (items.length === 0) {
    return null
  }

  const visibleItems = compact ? items.slice(0, 3) : items
  const hiddenItemsCount = items.length - visibleItems.length

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {visibleItems.map((item) => (
        <span
          key={item}
          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
        >
          {item}
        </span>
      ))}

      {hiddenItemsCount > 0 ? (
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
          + {hiddenItemsCount} infos
        </span>
      ) : null}
    </div>
  )
}

function StrengthExercisesPreview({
  exercises,
  compact,
}: {
  exercises: StrengthExercise[]
  compact: boolean
}) {
  const totalVolume = exercises.reduce((total, exercise) => {
    return total + getExerciseVolume(exercise)
  }, 0)

  if (compact) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Musculation
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
            </p>
          </div>

          {totalVolume > 0 ? (
            <div className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
              {formatNumber(totalVolume)} kg
            </div>
          ) : null}
        </div>
      </section>
    )
  }

  const visibleExercises = exercises.slice(0, 2)
  const hiddenExercisesCount = exercises.length - visibleExercises.length

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Musculation
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
          </p>
        </div>

        {totalVolume > 0 ? (
          <div className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
            {formatNumber(totalVolume)} kg
          </div>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        {visibleExercises.map((exercise) => (
          <StrengthExercisePreviewItem key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {hiddenExercisesCount > 0 ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-500">
          + {hiddenExercisesCount} exercice
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
    <article className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate font-bold text-slate-900">
            {exercise.name || 'Exercice sans nom'}
          </h4>

          {exercise.notes ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
              {exercise.notes}
            </p>
          ) : null}
        </div>

        {volume > 0 ? (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            {formatNumber(volume)} kg
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {exercise.sets ? (
          <MiniStat label="Séries" value={formatDisplayValue(exercise.sets)} />
        ) : null}

        {exercise.reps ? (
          <MiniStat label="Reps" value={formatDisplayValue(exercise.reps)} />
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
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
      <span className="text-slate-400">{label} :</span> {value}
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

function parseStrengthNumber(
  value: string | number | null | undefined,
): number {
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

function formatDisplayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  const trimmedValue = String(value).trim()

  return trimmedValue || '—'
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

function formatWeight(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  const trimmedValue = String(value).trim()

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

function formatRest(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  const trimmedValue = String(value).trim()

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
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatLabel(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  const formattedValue = String(value)
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .trim()

  if (!formattedValue) {
    return '—'
  }

  return formattedValue.replace(/^\p{L}/u, (letter) => letter.toUpperCase())
}
