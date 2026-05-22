import type { ReactNode } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { StrengthExercise, Workout } from '../types/workout'
import {
  getDistanceUnit,
  getElevationLabel,
  getPaceLabel,
  getSportDetailMode,
} from '../utils/sportDetails'

type WorkoutDetailPageProps = {
  workout: Workout
  onBack: () => void
  onEdit: (workoutId: string) => void
  onDelete?: (workoutId: string) => void
}

type TrendConfig = {
  icon: string
  label: string
  className: string
}

type OtherDetailItem = {
  label: string
  value: ReactNode
}

const trendConfig: Record<Workout['trend'], TrendConfig> = {
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
  const otherDetails = getOtherDetailsItems(workout)

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${workout.date}T00:00:00`))

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-slate-50">
      <section className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 via-white/[0.04] to-sky-400/10 p-5 shadow-2xl shadow-black/25 sm:p-7 lg:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/10 text-3xl sm:h-20 sm:w-20 sm:text-4xl">
                  {category?.emoji ?? '✨'}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                    Séance réalisée
                  </p>

                  <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                    {workout.title}
                  </h1>

                  <p className="mt-2 capitalize text-sm leading-6 text-slate-400 sm:text-base">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge>{category?.label ?? 'Autre'}</Badge>
                <Badge>{formatDuration(workout.duration)}</Badge>
                <Badge>Intensité {workout.intensity}</Badge>
                <Badge>Ressenti {workout.feeling}</Badge>
              </div>
            </div>

            <div className="grid gap-4">
              <TextPanel
                title="Notes"
                emptyText="Aucune note ajoutée pour cette séance."
              >
                {workout.notes}
              </TextPanel>

              <TextPanel
                title="À améliorer"
                variant="emerald"
                emptyText="Aucune idée d'amélioration ajoutée."
              >
                {workout.improvementIdea}
              </TextPanel>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {strengthExercises.length > 0 ? (
              <StrengthExercisesSection exercises={strengthExercises} />
            ) : null}

            {otherDetails.length > 0 ? (
              <OtherDetailsSection items={otherDetails} />
            ) : null}

            {strengthExercises.length === 0 && otherDetails.length === 0 ? (
              <EmptyPanel
                icon="📝"
                title="Aucun détail complémentaire"
                text="Cette séance contient seulement les informations principales."
              />
            ) : null}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <PerformanceSummaryPanel
              workout={workout}
              exercises={strengthExercises}
              trend={trend}
            />
          </aside>
        </div>

        <WorkoutAnalysisSection
          workout={workout}
          exercises={strengthExercises}
        />
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
  trend: TrendConfig
}) {
  const detailMode = getSportDetailMode(workout.category)
  const details = workout.details

  const totalVolume = getTotalVolume(exercises)
  const totalSets = getTotalSets(exercises)
  const heaviestExercise = getHeaviestExercise(exercises)
  const bestVolumeExercise = getBestVolumeExercise(exercises)
  const averageReps = getAverageReps(exercises)

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
        Résumé de séance
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatCard label="Durée" value={formatDuration(workout.duration)} />
        <StatCard label="Intensité" value={`${workout.intensity}`} />
        <StatCard label="Ressenti" value={`${workout.feeling}`} />

        {details?.distance ? (
          <StatCard
            label="Distance"
            value={`${details.distance} ${getDistanceUnit(workout.category)}`}
          />
        ) : null}

        {details?.pace ? (
          <StatCard
            label={getPaceLabel(workout.category)}
            value={details.pace}
          />
        ) : null}

        {details?.elevation ? (
          <StatCard
            label={getElevationLabel(workout.category)}
            value={`${details.elevation} m`}
          />
        ) : null}

        {details?.swimmingStyle ? (
          <StatCard label="Nage" value={details.swimmingStyle} />
        ) : null}

        {exercises.length > 0 ? (
          <>
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
          </>
        ) : null}
      </div>

      {bestVolumeExercise ? (
        <div className="mt-5 rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            Meilleur volume
          </p>

          <p className="mt-2 text-lg font-black text-white">
            {bestVolumeExercise.name || 'Exercice sans nom'}
          </p>

          <p className="mt-1 text-sm font-bold text-slate-400">
            {formatNumber(getExerciseVolume(bestVolumeExercise))} kg estimés
          </p>
        </div>
      ) : null}

      {detailMode === 'climb' ? (
        <div className="mt-5 rounded-3xl border border-orange-400/15 bg-orange-400/5 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
            Séance technique
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Pense à noter les blocs, les voies ou les cotations pour mieux
            suivre ta progression en escalade.
          </p>
        </div>
      ) : null}

      <div
        className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${trend.className}`}
      >
        <span>{trend.icon}</span>
        <span>{trend.label}</span>
      </div>
    </section>
  )
}

function WorkoutAnalysisSection({
  workout,
  exercises,
}: {
  workout: Workout
  exercises: StrengthExercise[]
}) {
  const totalVolume = getTotalVolume(exercises)
  const totalSets = getTotalSets(exercises)
  const heaviestExercise = getHeaviestExercise(exercises)
  const bestVolumeExercise = getBestVolumeExercise(exercises)

  const analysisItems = getWorkoutAnalysisItems({
    workout,
    totalVolume,
    totalSets,
    heaviestExercise,
    bestVolumeExercise,
    exercisesCount: exercises.length,
  })

  return (
    <section className="mt-6 rounded-[2rem] border border-sky-400/15 bg-gradient-to-br from-sky-400/10 via-white/[0.04] to-emerald-400/5 p-5 shadow-2xl shadow-black/20 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">
            Analyse de séance
          </p>

          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Ce que cette séance montre
          </h2>
        </div>

        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Analyse automatique basée sur la durée, la tendance et les détails
          enregistrés.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analysisItems.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-white/10 bg-slate-950/35 p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
              {item.icon}
            </div>

            <h3 className="mt-4 font-black text-white">{item.title}</h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {item.text}
            </p>
          </article>
        ))}
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
    <section className="overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-emerald-400/5 p-5 shadow-2xl shadow-black/20 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
            Exercices réalisés
          </p>

          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Détail musculation
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {exercises.length} exercice{exercises.length > 1 ? 's' : ''}{' '}
            enregistré{exercises.length > 1 ? 's' : ''}.
          </p>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-slate-950/60 px-5 py-3 text-sm font-black text-emerald-200">
          Volume estimé : {formatNumber(totalVolume)} kg
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-[1.75rem] border border-white/10 md:block">
        <table className="w-full table-fixed border-collapse">
          <thead className="bg-white/[0.08]">
            <tr className="text-left text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-500">
              <th className="w-[30%] px-4 py-4">Exercice</th>
              <th className="w-[12%] px-3 py-4 text-center">Séries</th>
              <th className="w-[12%] px-3 py-4 text-center">Reps</th>
              <th className="w-[16%] px-3 py-4 text-center">Charge</th>
              <th className="w-[14%] px-3 py-4 text-center">Repos</th>
              <th className="w-[16%] px-3 py-4 text-center">Volume</th>
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
                  <td className="px-4 py-4 align-middle">
                    <p className="break-words font-black text-white">
                      {exercise.name || 'Exercice sans nom'}
                    </p>

                    {exercise.notes ? (
                      <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                        {exercise.notes}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-3 py-4 text-center font-black text-sky-100">
                    {exercise.sets || '—'}
                  </td>

                  <td className="px-3 py-4 text-center font-black text-sky-100">
                    {exercise.reps || '—'}
                  </td>

                  <td className="px-3 py-4 text-center font-black text-sky-100">
                    {formatWeight(exercise.weight)}
                  </td>

                  <td className="px-3 py-4 text-center font-black text-sky-100">
                    {formatRest(exercise.rest)}
                  </td>

                  <td className="px-3 py-4 text-center font-black text-emerald-200">
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

      <div className="space-y-3 md:hidden">
        {exercises.map((exercise) => {
          const exerciseVolume = getExerciseVolume(exercise)

          return (
            <article
              key={exercise.id}
              className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-black text-white">
                    {exercise.name || 'Exercice sans nom'}
                  </h3>

                  {exercise.notes ? (
                    <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                      {exercise.notes}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200">
                  {exerciseVolume > 0
                    ? `${formatNumber(exerciseVolume)} kg`
                    : '—'}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat
                  label="Séries"
                  value={formatDisplayValue(exercise.sets)}
                />

                <MiniStat
                  label="Reps"
                  value={formatDisplayValue(exercise.reps)}
                />

                <MiniStat label="Charge" value={formatWeight(exercise.weight)} />

                <MiniStat label="Repos" value={formatRest(exercise.rest)} />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function OtherDetailsSection({ items }: { items: OtherDetailItem[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
        Autres détails
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </p>

            <p className="mt-2 break-words font-black text-white">
              {item.value}
            </p>
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
}: {
  title: string
  children?: ReactNode
  emptyText: string
  variant?: 'default' | 'emerald'
}) {
  const className =
    variant === 'emerald'
      ? 'border-emerald-400/15 bg-emerald-400/5'
      : 'border-white/10 bg-white/[0.04]'

  const hasContent =
    typeof children === 'string'
      ? children.trim().length > 0
      : Boolean(children)

  return (
    <section className={`rounded-[1.5rem] border p-5 ${className}`}>
      <p
        className={`text-xs font-black uppercase tracking-[0.2em] ${
          variant === 'emerald' ? 'text-emerald-300' : 'text-slate-500'
        }`}
      >
        {title}
      </p>

      <p className="mt-4 text-sm leading-7 text-slate-200">
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
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/20">
      <p className="text-5xl">{icon}</p>

      <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-7 text-slate-400">{text}</p>
    </section>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-slate-100 sm:text-sm">
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

      <p className="mt-2 break-words text-xl font-black text-white">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words font-black text-sky-100">{value}</p>
    </div>
  )
}

function getOtherDetailsItems(workout: Workout): OtherDetailItem[] {
  const details = workout.details

  if (!details) {
    return []
  }

  const detailMode = getSportDetailMode(workout.category)

  const exercisesLabel =
    detailMode === 'strength'
      ? 'Exercices'
      : detailMode === 'mobility'
        ? 'Programme'
        : detailMode === 'simple'
          ? 'Détails'
          : 'Programme prévu'

  const items: Array<OtherDetailItem | null> = [
    details.exercises
      ? {
          label: exercisesLabel,
          value: details.exercises,
        }
      : null,

    details.distance
      ? {
          label: 'Distance',
          value: `${details.distance} ${getDistanceUnit(workout.category)}`,
        }
      : null,

    details.pace
      ? {
          label: getPaceLabel(workout.category),
          value: details.pace,
        }
      : null,

    details.swimmingStyle
      ? {
          label: 'Nage',
          value: details.swimmingStyle,
        }
      : null,

    details.elevation
      ? {
          label: getElevationLabel(workout.category),
          value: `${details.elevation} m`,
        }
      : null,

    details.bodyZones
      ? {
          label: 'Zones travaillées',
          value: details.bodyZones,
        }
      : null,

    details.position
      ? {
          label: 'Poste',
          value: details.position,
        }
      : null,

    details.goals !== undefined
      ? {
          label: 'Buts',
          value: details.goals,
        }
      : null,

    details.assists !== undefined
      ? {
          label: 'Passes',
          value: details.assists,
        }
      : null,
  ]

  return items.filter((item): item is OtherDetailItem => item !== null)
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
  return exercises.reduce<StrengthExercise | null>((bestExercise, exercise) => {
    const currentWeight = parseSportNumber(exercise.weight)
    const bestWeight = bestExercise ? parseSportNumber(bestExercise.weight) : 0

    if (currentWeight > bestWeight) {
      return exercise
    }

    return bestExercise
  }, null)
}

function getBestVolumeExercise(
  exercises: StrengthExercise[],
): StrengthExercise | null {
  return exercises.reduce<StrengthExercise | null>((bestExercise, exercise) => {
    const currentVolume = getExerciseVolume(exercise)
    const bestVolume = bestExercise ? getExerciseVolume(bestExercise) : 0

    if (currentVolume > bestVolume) {
      return exercise
    }

    return bestExercise
  }, null)
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

function getWorkoutAnalysisItems({
  workout,
  totalVolume,
  totalSets,
  heaviestExercise,
  bestVolumeExercise,
  exercisesCount,
}: {
  workout: Workout
  totalVolume: number
  totalSets: number
  heaviestExercise: StrengthExercise | null
  bestVolumeExercise: StrengthExercise | null
  exercisesCount: number
}) {
  const items: Array<{
    icon: string
    title: string
    text: string
  }> = []

  const detailMode = getSportDetailMode(workout.category)
  const details = workout.details

  if (workout.duration < 30) {
    items.push({
      icon: '⚡',
      title: 'Séance courte',
      text: 'Format rapide : parfait pour garder le rythme même quand tu as peu de temps.',
    })
  } else if (workout.duration >= 60) {
    items.push({
      icon: '🔥',
      title: 'Séance complète',
      text: 'Grosse séance : tu as pris le temps de travailler en profondeur.',
    })
  } else {
    items.push({
      icon: '✅',
      title: 'Séance équilibrée',
      text: 'Durée correcte : bon compromis entre efficacité et régularité.',
    })
  }

  if (detailMode === 'strength' && exercisesCount > 0) {
    items.push({
      icon: '🏋️',
      title: 'Volume de travail',
      text:
        totalVolume > 0
          ? `Tu as réalisé environ ${formatNumber(
              totalVolume,
            )} kg de volume sur ${totalSets} séries.`
          : `Tu as réalisé ${totalSets} séries sur ${exercisesCount} exercice${
              exercisesCount > 1 ? 's' : ''
            }.`,
    })
  }

  if (detailMode === 'strength' && heaviestExercise) {
    items.push({
      icon: '💪',
      title: 'Charge la plus lourde',
      text: `${heaviestExercise.name || 'Un exercice'} ressort avec la charge la plus élevée : ${formatWeight(
        heaviestExercise.weight,
      )}.`,
    })
  }

  if (detailMode === 'strength' && bestVolumeExercise) {
    items.push({
      icon: '📊',
      title: 'Exercice dominant',
      text: `${
        bestVolumeExercise.name || 'Un exercice'
      } représente le plus gros volume de cette séance.`,
    })
  }

  if (
    (detailMode === 'endurance' ||
      detailMode === 'bike' ||
      detailMode === 'swim') &&
    details?.distance
  ) {
    items.push({
      icon:
        detailMode === 'bike' ? '🚴' : detailMode === 'swim' ? '🏊' : '🏃',
      title: 'Distance travaillée',
      text: `Tu as enregistré ${details.distance} ${getDistanceUnit(
        workout.category,
      )}, ce qui permet de suivre ton volume d’endurance.`,
    })
  }

  if (
    (detailMode === 'endurance' ||
      detailMode === 'bike' ||
      detailMode === 'climb') &&
    details?.elevation
  ) {
    items.push({
      icon: '⛰️',
      title: 'Travail en relief',
      text: `${getElevationLabel(workout.category)} indiqué : ${
        details.elevation
      } m. Cela montre une séance plus exigeante qu’une séance plate.`,
    })
  }

  if (detailMode === 'mobility' && details?.bodyZones) {
    items.push({
      icon: '🧘',
      title: 'Mobilité ciblée',
      text: `Tu as travaillé : ${details.bodyZones}. C’est utile pour équilibrer ton entraînement et améliorer ta récupération.`,
    })
  }

  if (detailMode === 'climb') {
    items.push({
      icon: '🧗',
      title: 'Séance technique',
      text: 'L’escalade combine force, gainage, coordination et mental. Note les voies ou blocs pour mieux suivre ta progression.',
    })
  }

  if (workout.trend === 'progress') {
    items.push({
      icon: '📈',
      title: 'Bonne dynamique',
      text: 'La séance est notée en progression : tu peux t’appuyer dessus pour continuer à monter doucement.',
    })
  }

  if (workout.trend === 'regress') {
    items.push({
      icon: '🧠',
      title: 'Séance à analyser',
      text: 'La séance est marquée en régression : fatigue, récupération ou intensité trop élevée peuvent expliquer ça.',
    })
  }

  if (workout.trend === 'record') {
    items.push({
      icon: '🏆',
      title: 'Record détecté',
      text: 'Très grosse séance : pense à bien récupérer avant de chercher à refaire mieux.',
    })
  }

  if (items.length === 0) {
    items.push({
      icon: '📝',
      title: 'Analyse en attente',
      text: 'Ajoute plus de détails à ta séance pour obtenir une analyse plus précise.',
    })
  }

  return items.slice(0, 4)
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

function formatDisplayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }

  const trimmedValue = String(value).trim()

  return trimmedValue || '—'
}

function formatDuration(minutes: number): string {
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