import { Link } from 'react-router-dom'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { PlannedWorkout } from '../types/plannedWorkout'

type NextPlannedWorkoutCardProps = {
  plannedWorkouts: PlannedWorkout[]
}

function getTodayDate() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return today
}

function getDateFromString(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)
  parsedDate.setHours(0, 0, 0, 0)

  return parsedDate
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(getDateFromString(date))
}

function getTimeStatus(date: string) {
  const today = getTodayDate()
  const plannedDate = getDateFromString(date)

  const differenceInDays = Math.round(
    (plannedDate.getTime() - today.getTime()) / 86_400_000
  )

  if (differenceInDays < 0) {
    return 'À rattraper'
  }

  if (differenceInDays === 0) {
    return 'Aujourd’hui'
  }

  if (differenceInDays === 1) {
    return 'Demain'
  }

  return `Dans ${differenceInDays} jours`
}

function getNextPlannedWorkout(plannedWorkouts: PlannedWorkout[]) {
  const today = getTodayDate()

  const sortedPlannedWorkouts = [...plannedWorkouts].sort((a, b) => {
    return getDateFromString(a.date).getTime() - getDateFromString(b.date).getTime()
  })

  const upcomingWorkout = sortedPlannedWorkouts.find((plannedWorkout) => {
    return getDateFromString(plannedWorkout.date).getTime() >= today.getTime()
  })

  if (upcomingWorkout) {
    return upcomingWorkout
  }

  return sortedPlannedWorkouts.at(-1)
}

export default function NextPlannedWorkoutCard({
  plannedWorkouts,
}: NextPlannedWorkoutCardProps) {
  const nextPlannedWorkout = getNextPlannedWorkout(plannedWorkouts)

  if (!nextPlannedWorkout) {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between gap-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Prochaine séance
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight text-white">
              Rien de prévu.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
              Planifie ta prochaine séance pour garder une direction claire et éviter de repousser.
            </p>
          </div>

          <Link
            to="/planning"
            className="inline-flex w-full justify-center rounded-full bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300 sm:w-fit"
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

  const status = getTimeStatus(nextPlannedWorkout.date)
  const isLate = status === 'À rattraper'

  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl sm:p-8 ${
        isLate
          ? 'border-orange-400/25 bg-orange-400/10 shadow-orange-400/5'
          : 'border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 via-white/[0.04] to-cyan-400/10 shadow-emerald-400/10'
      }`}
    >
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between gap-8">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className={`text-sm font-bold uppercase tracking-[0.25em] ${
                  isLate ? 'text-orange-300' : 'text-emerald-300'
                }`}
              >
                {isLate ? 'Séance à rattraper' : 'Prochaine séance'}
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight text-white">
                {nextPlannedWorkout.title}
              </h2>
            </div>

            <div
              className={`w-fit rounded-3xl border px-5 py-4 ${
                isLate
                  ? 'border-orange-400/20 bg-orange-400/10'
                  : 'border-emerald-400/20 bg-emerald-400/10'
              }`}
            >
              <p
                className={`text-sm ${
                  isLate ? 'text-orange-300' : 'text-emerald-300'
                }`}
              >
                Statut
              </p>

              <p className="mt-1 text-2xl font-black text-white">
                {status}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
              {sportCategory?.emoji ?? '🏃'} {sportCategory?.label ?? nextPlannedWorkout.category}
            </span>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
              {nextPlannedWorkout.duration} min
            </span>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
              {formatDate(nextPlannedWorkout.date)}
            </span>
          </div>

          {nextPlannedWorkout.objective ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm font-bold text-slate-300">
                Objectif de la séance
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                {nextPlannedWorkout.objective}
              </p>
            </div>
          ) : (
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400">
              Aucun objectif précis n’a encore été ajouté. Tu peux le compléter depuis le planning.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/planning"
            className="inline-flex justify-center rounded-full bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
          >
            Voir le planning
          </Link>

          <Link
            to="/workouts/new"
            className="inline-flex justify-center rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10"
          >
            Ajouter une séance
          </Link>
        </div>
      </div>
    </section>
  )
}