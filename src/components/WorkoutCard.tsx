import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { Workout } from '../types/workout'

type WorkoutCardProps = {
  workout: Workout
  onEdit?: (workoutId: string) => void
  onDelete?: (workoutId: string) => void
}

const trendConfig = {
  progress: {
    icon: '📈',
    label: 'Progression',
    className: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  },
  stable: {
    icon: '⚖️',
    label: 'Stable',
    className: 'bg-sky-400/10 text-sky-300 border-sky-400/20',
  },
  regress: {
    icon: '📉',
    label: 'Régression',
    className: 'bg-orange-400/10 text-orange-300 border-orange-400/20',
  },
  record: {
    icon: '🔥',
    label: 'Record',
    className: 'bg-red-400/10 text-red-300 border-red-400/20',
  },
  first: {
    icon: '🌱',
    label: 'Première séance',
    className: 'bg-lime-400/10 text-lime-300 border-lime-400/20',
  },
}

export default function WorkoutCard({
  workout,
  onEdit,
  onDelete,
}: WorkoutCardProps) {
  const category = SPORT_CATEGORIES.find((item) => item.id === workout.category)
  const trend = trendConfig[workout.trend]

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(workout.date))

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{formattedDate}</p>

          <h3 className="mt-2 text-xl font-black text-white">
            {workout.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(workout.id)}
              className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-sm font-black text-sky-300 transition hover:bg-sky-400/20"
              aria-label="Modifier la séance"
            >
              ✎
            </button>
          ) : null}

          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(workout.id)}
              className="rounded-2xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm font-black text-red-300 transition hover:bg-red-400/20"
              aria-label="Supprimer la séance"
            >
              ✕
            </button>
          ) : null}

          <div className="rounded-2xl bg-white/10 px-3 py-2 text-2xl">
            {category?.emoji ?? '✨'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
          {category?.label ?? 'Autre'}
        </span>

        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
          {workout.duration} min
        </span>

        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
          Intensité : {workout.intensity}
        </span>
      </div>
      <WorkoutDetailsList workout={workout} />

      <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold ${trend.className}`}>
        <span>{trend.icon}</span>
        <span>{trend.label}</span>
      </div>

      {workout.notes ? (
        <p className="mt-4 text-sm leading-6 text-slate-300">
          {workout.notes}
        </p>
      ) : null}

      {workout.improvementIdea ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            À améliorer
          </p>
          <p className="mt-2 text-sm text-slate-200">
            {workout.improvementIdea}
          </p>
        </div>
      ) : null}
    </article>
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
    details.distance ? `Distance : ${details.distance} ${workout.category === 'natation' ? 'm' : 'km'}` : null,
    details.pace ? `Allure : ${details.pace}` : null,
    details.swimmingStyle ? `Nage : ${details.swimmingStyle}` : null,
    details.position ? `Poste : ${details.position}` : null,
    details.goals !== undefined ? `Buts : ${details.goals}` : null,
    details.assists !== undefined ? `Passes : ${details.assists}` : null,
    details.elevation ? `Dénivelé : ${details.elevation} m` : null,
    details.bodyZones ? `Zones : ${details.bodyZones}` : null,
  ].filter(Boolean)

  if (items.length === 0) {
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200"
        >
          {item}
        </span>
      ))}
    </div>
  )
}