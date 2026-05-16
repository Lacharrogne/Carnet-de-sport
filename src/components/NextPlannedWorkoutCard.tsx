import { Link } from 'react-router-dom'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { PlannedWorkout } from '../types/plannedWorkout'

type NextPlannedWorkoutCardProps = {
  plannedWorkouts: PlannedWorkout[]
}

export default function NextPlannedWorkoutCard({
  plannedWorkouts,
}: NextPlannedWorkoutCardProps) {
  const sortedPlannedWorkouts = [...plannedWorkouts].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const nextPlannedWorkout = sortedPlannedWorkouts[0]

  if (!nextPlannedWorkout) {
    return (
      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Prochaine séance
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              Rien de prévu pour l’instant.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Planifie une séance pour garder une direction claire et éviter de repousser.
            </p>
          </div>

          <Link
            to="/planning"
            className="rounded-full bg-emerald-400 px-6 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-emerald-300"
          >
            Planifier une séance
          </Link>
        </div>
      </section>
    )
  }

  const sportCategory = SPORT_CATEGORIES.find((category) => {
    return category.id === nextPlannedWorkout.category
  })

  return (
    <section className="mt-8 rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6 shadow-2xl shadow-emerald-400/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
            Prochaine séance
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            {nextPlannedWorkout.title}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white">
              {sportCategory?.emoji} {sportCategory?.label}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white">
              {nextPlannedWorkout.duration} min
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white">
              {formatDate(nextPlannedWorkout.date)}
            </span>
          </div>

          {nextPlannedWorkout.objective ? (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Objectif : {nextPlannedWorkout.objective}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <div className="rounded-3xl border border-emerald-400/20 bg-slate-950/50 px-5 py-4">
            <p className="text-sm text-emerald-300">
              Statut
            </p>

            <p className="mt-1 text-2xl font-black text-white">
              {getTimeStatus(nextPlannedWorkout.date)}
            </p>
          </div>

          <Link
            to="/planning"
            className="rounded-full bg-emerald-400 px-6 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-emerald-300"
          >
            Voir le planning
          </Link>
        </div>
      </div>
    </section>
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getTimeStatus(date: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const plannedDate = new Date(`${date}T00:00:00`)
  plannedDate.setHours(0, 0, 0, 0)

  const differenceInDays = Math.round(
    (plannedDate.getTime() - today.getTime()) / 86_400_000
  )

  if (differenceInDays < 0) {
    return 'En retard'
  }

  if (differenceInDays === 0) {
    return 'Aujourd’hui'
  }

  if (differenceInDays === 1) {
    return 'Demain'
  }

  return `Dans ${differenceInDays} jours`
}