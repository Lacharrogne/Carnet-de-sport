import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { Workout } from '../types/workout'

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
      <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl opacity-0 transition group-hover:opacity-100" />

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

function InfoPill({ children }: { children: React.ReactNode }) {
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

  const items = [
    details.exercises ? `Exercices : ${details.exercises}` : null,
    details.sets ? `${details.sets} séries` : null,
    details.reps ? `${details.reps} reps` : null,
    details.weight ? `${details.weight} kg` : null,
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

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-bold text-sky-200"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function formatLabel(value: string) {
  return value
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/^\p{L}/u, (letter) => letter.toUpperCase())
}