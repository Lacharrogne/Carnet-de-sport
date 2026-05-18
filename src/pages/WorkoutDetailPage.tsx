import type { ReactNode } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { StrengthExercise, Workout } from '../types/workout'

type WorkoutDetailPageProps = {
  workout: Workout
  onBack: () => void
  onEdit: (workoutId: string) => void
  onDelete?: (workoutId: string) => void
}

type TrendDisplay = {
  icon: string
  label: string
  className: string
}

const trendConfig: Record<Workout['trend'], TrendDisplay> = {
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

export default function WorkoutDetailPage({
  workout,
  onBack,
  onEdit,
  onDelete,
}: WorkoutDetailPageProps) {
  const category = SPORT_CATEGORIES.find((item) => {
    return item.id === workout.category
  })

  const trend = trendConfig[workout.trend] ?? trendConfig.stable
  const strengthExercises = workout.details?.strengthExercises ?? []

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${workout.date}T00:00:00`))

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-200 transition hover:bg-white/10"
          >
            ← Retour au carnet
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onEdit(workout.id)}
              className="rounded-full border border-sky-400/20 bg-sky-400/10 px-5 py-3 text-sm font-black text-sky-200 transition hover:bg-sky-400/20"
            >
              ✎ Modifier
            </button>

            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(workout.id)}
                className="rounded-full border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-400/20"
              >
                ✕ Supprimer
              </button>
            ) : null}
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 via-white/[0.04] to-sky-400/10 p-8 shadow-2xl shadow-black/30">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 text-5xl shadow-2xl shadow-black/20">
                  {category?.emoji ?? '✨'}
                </div>

                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
                    Séance réalisée
                  </p>

                  <h1 className="mt-2 text-5xl font-black leading-tight text-white md:text-6xl">
                    {workout.title}
                  </h1>

                  <p className="mt-3 text-lg capitalize text-slate-400">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Badge>{category?.label ?? 'Autre'}</Badge>
                <Badge>{workout.duration} min</Badge>
                <Badge>Intensité : {workout.intensity}</Badge>
                <Badge>Ressenti : {workout.feeling}</Badge>
              </div>
            </div>

            <aside className="space-y-4">
              <TextPanel
                title="Notes"
                emptyText="Aucune note ajoutée pour cette séance."
                compact
              >
                {workout.notes}
              </TextPanel>

              <TextPanel
                title="À améliorer"
                variant="emerald"
                emptyText="Aucune idée d'amélioration ajoutée."
                compact
              >
                {workout.improvementIdea}
              </TextPanel>
            </aside>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            {strengthExercises.length > 0 ? (
              <StrengthExercisesSection exercises={strengthExercises} />
            ) : (
              <EmptyPanel
                icon="🏋️"
                title="Aucun exercice détaillé"
                text="Cette séance ne contient pas encore de détail musculation."
              />
            )}

            <OtherDetailsSection workout={workout} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <PerformanceSummaryPanel
              workout={workout}
              exercises={strengthExercises}
              trend={trend}
            />
          </aside>
        </div>
      </section>
    </main>
  )
}

function PerformanceSummaryPanel({
  workout,
  exercises,
  trend,
}: {
  workout: Workout
  exercises: StrengthExercise[]
  trend: TrendDisplay
}) {
  const totalVolume = getTotalVolume(exercises)
  const totalSets = getTotalSets(exercises)
  const heaviestExercise = getHeaviestExercise(exercises)
  const bestVolumeExercise = getBestVolumeExercise(exercises)
  const averageReps = getAverageReps(exercises)

  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
        Résumé de performance
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Durée" value={`${workout.duration} min`} />
        <StatCard label="Exercices" value={`${exercises.length}`} />
        <StatCard label="Séries" value={`${totalSets}`} />

        <StatCard
          label="Volume"
          value={totalVolume > 0 ? `${formatNumber(totalVolume)} kg` : '—'}
        />

        <StatCard
          label="Charge max"
          value={
            heaviestExercise ? formatWeight(heaviestExercise.weight) : '—'
          }
        />

        <StatCard
          label="Moy. reps"
          value={averageReps > 0 ? `${averageReps} reps` : '—'}
        />
      </div>

      {bestVolumeExercise ? (
        <div className="mt-5 rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            Meilleur volume
          </p>

          <p className="mt-2 text-xl font-black text-white">
            {bestVolumeExercise.name || 'Exercice sans nom'}
          </p>

          <p className="mt-1 text-sm font-bold text-slate-400">
            {formatNumber(getExerciseVolume(bestVolumeExercise))} kg estimés
          </p>
        </div>
      ) : null}

      <div
        className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${trend.className}`}
      >
        <span>{trend.icon}</span>
        <span>{trend.label}</span>
      </div>
    </section>
  )
}

function StrengthExercisesSection({
  exercises,
}: {
  exercises: StrengthExercise[]
}) {
  const totalVolume = getTotalVolume(exercises)

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-emerald-400/15 bg-emerald-400/5 p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
            Exercices réalisés
          </p>

          <h2 className="mt-2 text-4xl font-black text-white">
            Détail musculation
          </h2>

          <p className="mt-2 text-lg text-slate-400">
            {exercises.length} exercice{exercises.length > 1 ? 's' : ''}{' '}
            enregistré{exercises.length > 1 ? 's' : ''}.
          </p>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-slate-950/60 px-5 py-3 text-sm font-black text-emerald-200">
          Volume estimé : {formatNumber(totalVolume)} kg
        </div>
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-white/10">
        <table className="w-full min-w-[780px] border-collapse">
          <thead className="bg-white/[0.08]">
            <tr className="text-left text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              <th className="px-5 py-4">Exercice</th>
              <th className="px-5 py-4">Séries</th>
              <th className="px-5 py-4">Reps</th>
              <th className="px-5 py-4">Charge</th>
              <th className="px-5 py-4">Repos</th>
              <th className="px-5 py-4">Volume</th>
            </tr>
          </thead>

          <tbody>
            {exercises.map((exercise) => {
              const exerciseVolume = getExerciseVolume(exercise)

              return (
                <tr
                  key={exercise.id}
                  className="border-t border-white/10 transition hover:bg-white/[0.04]"
                >
                  <td className="px-5 py-5">
                    <p className="font-black text-white">
                      {exercise.name || 'Exercice sans nom'}
                    </p>

                    {exercise.notes ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {exercise.notes}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-5 py-5 font-black text-sky-100">
                    {exercise.sets || '—'}
                  </td>

                  <td className="px-5 py-5 font-black text-sky-100">
                    {exercise.reps || '—'}
                  </td>

                  <td className="px-5 py-5 font-black text-sky-100">
                    {formatWeight(exercise.weight)}
                  </td>

                  <td className="px-5 py-5 font-black text-sky-100">
                    {formatRest(exercise.rest)}
                  </td>

                  <td className="px-5 py-5 font-black text-emerald-200">
                    {exerciseVolume > 0
                      ? `${formatNumber(exerciseVolume)} kg`
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function OtherDetailsSection({ workout }: { workout: Workout }) {
  const details = workout.details

  if (!details) {
    return null
  }

  const items: Array<[string, ReactNode] | null> = [
    details.exercises ? ['Exercices', details.exercises] : null,
    details.distance
      ? [
          'Distance',
          `${details.distance} ${workout.category === 'natation' ? 'm' : 'km'}`,
        ]
      : null,
    details.pace ? ['Allure', details.pace] : null,
    details.swimmingStyle ? ['Nage', details.swimmingStyle] : null,
    details.position ? ['Poste', details.position] : null,
    details.goals !== undefined ? ['Buts', details.goals] : null,
    details.assists !== undefined ? ['Passes', details.assists] : null,
    details.elevation ? ['Dénivelé', `${details.elevation} m`] : null,
    details.bodyZones ? ['Zones travaillées', details.bodyZones] : null,
  ]

  const visibleItems = items.filter(
    (item): item is [string, ReactNode] => item !== null,
  )

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
        Autres détails
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {visibleItems.map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {label}
            </p>

            <p className="mt-2 font-black text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function TextPanel({
  title,
  children,
  emptyText,
  variant = 'default',
  compact = false,
}: {
  title: string
  children?: ReactNode
  emptyText: string
  variant?: 'default' | 'emerald'
  compact?: boolean
}) {
  const className =
    variant === 'emerald'
      ? 'border-emerald-400/15 bg-emerald-400/5'
      : 'border-white/10 bg-slate-950/35'

  const hasContent =
    typeof children === 'string' ? children.trim().length > 0 : Boolean(children)

  return (
    <section
      className={`rounded-[2rem] border ${compact ? 'p-5' : 'p-6'} ${className}`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.25em] ${
          variant === 'emerald' ? 'text-emerald-300' : 'text-slate-500'
        }`}
      >
        {title}
      </p>

      <p className="mt-4 leading-8 text-slate-200">
        {hasContent ? children : emptyText}
      </p>
    </section>
  )
}

function EmptyPanel({
  icon,
  title,
  text,
}: {
  icon: string
  title: string
  text: string
}) {
  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 text-center">
      <p className="text-5xl">{icon}</p>

      <h2 className="mt-4 text-3xl font-black text-white">{title}</h2>

      <p className="mt-2 text-slate-400">{text}</p>
    </section>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-black text-slate-100">
      {children}
    </span>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function getTotalVolume(exercises: StrengthExercise[]): number {
  return exercises.reduce((total, exercise) => {
    return total + getExerciseVolume(exercise)
  }, 0)
}

function getExerciseVolume(exercise: StrengthExercise): number {
  const sets = parseSportNumber(exercise.sets)
  const reps = parseSportNumber(exercise.reps)
  const weight = parseSportNumber(exercise.weight)

  if (!sets || !reps || !weight) {
    return 0
  }

  return sets * reps * weight
}

function getTotalSets(exercises: StrengthExercise[]): number {
  return exercises.reduce((total, exercise) => {
    return total + parseSportNumber(exercise.sets)
  }, 0)
}

function getHeaviestExercise(
  exercises: StrengthExercise[],
): StrengthExercise | null {
  let heaviestExercise: StrengthExercise | null = null
  let heaviestWeight = 0

  exercises.forEach((exercise) => {
    const weight = parseSportNumber(exercise.weight)

    if (weight > heaviestWeight) {
      heaviestWeight = weight
      heaviestExercise = exercise
    }
  })

  return heaviestExercise
}

function getBestVolumeExercise(
  exercises: StrengthExercise[],
): StrengthExercise | null {
  let bestExercise: StrengthExercise | null = null
  let bestVolume = 0

  exercises.forEach((exercise) => {
    const volume = getExerciseVolume(exercise)

    if (volume > bestVolume) {
      bestVolume = volume
      bestExercise = exercise
    }
  })

  return bestExercise
}

function getAverageReps(exercises: StrengthExercise[]): number {
  if (exercises.length === 0) {
    return 0
  }

  const totalReps = exercises.reduce((total, exercise) => {
    return total + parseSportNumber(exercise.reps)
  }, 0)

  return Math.round(totalReps / exercises.length)
}

function parseSportNumber(value: string | number | null | undefined): number {
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

function formatWeight(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }

  const trimmedValue = String(value).trim()

  if (!trimmedValue) {
    return '—'
  }

  if (/^\d+([,.]\d+)?$/.test(trimmedValue)) {
    return `${trimmedValue} kg`
  }

  return trimmedValue
}

function formatRest(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }

  const trimmedValue = String(value).trim()

  if (!trimmedValue) {
    return '—'
  }

  if (/^\d+([,.]\d+)?$/.test(trimmedValue)) {
    return `${trimmedValue} min`
  }

  return trimmedValue
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value)
}