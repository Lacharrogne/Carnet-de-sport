import type { ReactNode } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { StrengthExercise, Workout } from '../types/workout'

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

          <div className="relative grid gap-8 xl:grid-cols-[1fr_420px]">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/10 text-4xl">
                  {category?.emoji ?? '✨'}
                </div>

                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
                    Séance réalisée
                  </p>

                  <h1 className="mt-2 text-4xl font-black leading-tight text-white md:text-5xl">
                    {workout.title}
                  </h1>

                  <p className="mt-2 capitalize text-slate-400">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Badge>{category?.label ?? 'Autre'}</Badge>
                <Badge>{workout.duration} min</Badge>
                <Badge>Intensité : {workout.intensity}</Badge>
                <Badge>Ressenti : {workout.feeling}</Badge>
              </div>
            </div>

            <div className="space-y-5">
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

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
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

          <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
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
  const totalVolume = getTotalVolume(exercises)
  const totalSets = getTotalSets(exercises)
  const heaviestExercise = getHeaviestExercise(exercises)
  const bestVolumeExercise = getBestVolumeExercise(exercises)
  const averageReps = getAverageReps(exercises)

  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
        Résumé de performance
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatCard label="Durée" value={`${workout.duration} min`} />
        <StatCard label="Exercices" value={`${exercises.length}`} />
        <StatCard label="Séries" value={`${totalSets}`} />

        <StatCard
          label="Volume"
          value={totalVolume > 0 ? `${formatNumber(totalVolume)} kg` : '—'}
        />

        <StatCard
          label="Charge max"
          value={heaviestExercise ? formatWeight(heaviestExercise.weight) : '—'}
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

          <p className="mt-2 text-lg font-black text-white">
            {bestVolumeExercise.name || 'Exercice sans nom'}
          </p>

          <p className="mt-1 text-sm font-bold text-slate-400">
            {formatNumber(getExerciseVolume(bestVolumeExercise))} kg estimés
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
    <section className="mt-8 rounded-[2.5rem] border border-sky-400/15 bg-gradient-to-br from-sky-400/10 via-white/[0.04] to-emerald-400/5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
            Analyse de séance
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            Ce que cette séance montre
          </h2>
        </div>

        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Analyse automatique basée sur la durée, le volume, les charges et les
          exercices enregistrés.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
    <section className="overflow-hidden rounded-[2.5rem] border border-emerald-400/15 bg-emerald-400/5 p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
            Exercices réalisés
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            Détail musculation
          </h2>

          <p className="mt-2 text-slate-400">
            {exercises.length} exercice{exercises.length > 1 ? 's' : ''}{' '}
            enregistré{exercises.length > 1 ? 's' : ''}.
          </p>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-slate-950/60 px-5 py-3 text-sm font-black text-emerald-200">
          Volume estimé : {formatNumber(totalVolume)} kg
        </div>
      </div>

      <div className="hidden rounded-[2rem] border border-white/10 md:block">
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
                <div>
                  <h3 className="text-lg font-black text-white">
                    {exercise.name || 'Exercice sans nom'}
                  </h3>

                  {exercise.notes ? (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {exercise.notes}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200">
                  {exerciseVolume > 0
                    ? `${formatNumber(exerciseVolume)} kg`
                    : '—'}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="Séries" value={formatDisplayValue(exercise.sets)} />
                <MiniStat label="Reps" value={formatDisplayValue(exercise.reps)} />
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
    <section className={`rounded-[2rem] border p-6 ${className}`}>
      <p
        className={`text-xs font-black uppercase tracking-[0.25em] ${
          variant === 'emerald' ? 'text-emerald-300' : 'text-slate-500'
        }`}
      >
        {title}
      </p>

      <p className="mt-5 leading-8 text-slate-200">
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
    <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-slate-100">
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

      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-black text-sky-100">{value}</p>
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
  return exercises.reduce<StrengthExercise | null>((bestExercise, exercise) => {
    const currentWeight = parseSportNumber(exercise.weight)
    const bestWeight = bestExercise
      ? parseSportNumber(bestExercise.weight)
      : 0

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

  if (exercisesCount > 0) {
    items.push({
      icon: '🏋️',
      title: 'Volume de travail',
      text:
        totalVolume > 0
          ? `Tu as réalisé environ ${formatNumber(totalVolume)} kg de volume sur ${totalSets} séries.`
          : `Tu as réalisé ${totalSets} séries sur ${exercisesCount} exercice${
              exercisesCount > 1 ? 's' : ''
            }.`,
    })
  }

  if (heaviestExercise) {
    items.push({
      icon: '💪',
      title: 'Charge la plus lourde',
      text: `${heaviestExercise.name || 'Un exercice'} ressort avec la charge la plus élevée : ${formatWeight(
        heaviestExercise.weight,
      )}.`,
    })
  }

  if (bestVolumeExercise) {
    items.push({
      icon: '📊',
      title: 'Exercice dominant',
      text: `${
        bestVolumeExercise.name || 'Un exercice'
      } représente le plus gros volume de cette séance.`,
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
      text: 'La séance est marquée en régression : fatigue, récupération ou charge trop élevée peuvent expliquer ça.',
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