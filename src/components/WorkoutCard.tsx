import type { ReactNode } from 'react'

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
        'group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-emerald-400/25 hover:bg-white/[0.07]',
        isCompact ? 'p-4 sm:p-5' : 'p-5',
        onOpen ? 'cursor-pointer' : '',
      ].join(' ')}
      onClick={handleOpen}
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 opacity-0 blur-3xl transition group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              {formattedDate}
            </p>

            <h3
              className={[
                'mt-2 line-clamp-2 break-words font-black leading-tight text-white',
                isCompact ? 'text-xl' : 'text-xl sm:text-2xl',
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

        <div className="mt-4 flex flex-wrap gap-2">
          <InfoPill>{category?.label ?? 'Autre'}</InfoPill>
          <InfoPill>{formatDuration(workout.duration)}</InfoPill>
          <InfoPill>Intensité {formatLabel(workout.intensity)}</InfoPill>

          {!isCompact ? (
            <InfoPill>Ressenti {formatLabel(workout.feeling)}</InfoPill>
          ) : null}
        </div>

        <WorkoutDetailsList workout={workout} compact={isCompact} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${trend.className}`}
          >
            <span>{trend.icon}</span>
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
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm font-black text-slate-300 transition group-hover:border-emerald-400/25 group-hover:text-emerald-200">
              Voir le détail →
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}

function InfoPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-slate-100">
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
      ? 'border-emerald-400/15 bg-emerald-400/5'
      : 'border-white/10 bg-slate-950/35'

  const titleClassName =
    variant === 'emerald' ? 'text-emerald-300' : 'text-slate-500'

  return (
    <div className={`rounded-3xl border p-4 ${className}`}>
      <p
        className={`text-xs font-black uppercase tracking-[0.18em] ${titleClassName}`}
      >
        {title}
      </p>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
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
        <StrengthExercisesPreview exercises={strengthExercises} compact={compact} />
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
          className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-bold text-sky-200"
        >
          {item}
        </span>
      ))}

      {hiddenItemsCount > 0 ? (
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-slate-300">
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
      <section className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              Musculation
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
      </section>
    )
  }

  const visibleExercises = exercises.slice(0, 2)
  const hiddenExercisesCount = exercises.length - visibleExercises.length

  return (
    <section className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            Musculation
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

      <div className="mt-3 space-y-2">
        {visibleExercises.map((exercise) => (
          <StrengthExercisePreviewItem
            key={exercise.id}
            exercise={exercise}
          />
        ))}
      </div>

      {hiddenExercisesCount > 0 ? (
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-center text-sm font-black text-slate-300">
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