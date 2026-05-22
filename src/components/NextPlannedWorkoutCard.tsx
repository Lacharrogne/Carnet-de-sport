import { Link } from 'react-router-dom'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { PlannedWorkout } from '../types/plannedWorkout'

type NextPlannedWorkoutCardProps = {
  plannedWorkouts: PlannedWorkout[]
}

export default function NextPlannedWorkoutCard({
  plannedWorkouts,
}: NextPlannedWorkoutCardProps) {
  const nextPlannedWorkout = getNextPlannedWorkout(plannedWorkouts)

  if (!nextPlannedWorkout) {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
            Prochaine séance
          </p>

          <h2 className="mt-3 text-2xl font-black leading-tight text-white">
            Rien de prévu.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Planifie ta prochaine séance pour garder une direction claire.
          </p>

          <Link
            to="/planning"
            className="mt-5 inline-flex w-full justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
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
      className={[
        'relative overflow-hidden rounded-[2rem] border p-5 shadow-2xl sm:p-6',
        isLate
          ? 'border-orange-400/25 bg-orange-400/10 shadow-orange-400/5'
          : 'border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 via-white/[0.04] to-sky-400/10 shadow-emerald-400/10',
      ].join(' ')}
    >
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={[
                'text-xs font-black uppercase tracking-[0.24em]',
                isLate ? 'text-orange-300' : 'text-emerald-300',
              ].join(' ')}
            >
              {isLate ? 'Séance à rattraper' : 'Prochaine séance'}
            </p>

            <h2 className="mt-3 line-clamp-2 text-2xl font-black leading-tight text-white">
              {nextPlannedWorkout.title}
            </h2>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
            {sportCategory?.emoji ?? '🏃'}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <InfoPill>
            {sportCategory?.label ?? nextPlannedWorkout.category}
          </InfoPill>

          <InfoPill>{formatDuration(nextPlannedWorkout.duration)}</InfoPill>

          <InfoPill>{formatDate(nextPlannedWorkout.date)}</InfoPill>
        </div>

        <div
          className={[
            'mt-5 rounded-3xl border p-4',
            isLate
              ? 'border-orange-400/20 bg-orange-400/10'
              : 'border-emerald-400/15 bg-emerald-400/5',
          ].join(' ')}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p
                className={[
                  'text-xs font-black uppercase tracking-[0.18em]',
                  isLate ? 'text-orange-300' : 'text-emerald-300',
                ].join(' ')}
              >
                Statut
              </p>

              <p className="mt-1 text-xl font-black text-white">{status}</p>
            </div>

            <p className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-xs font-black text-slate-200">
              🎯 À venir
            </p>
          </div>

          {nextPlannedWorkout.objective ? (
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
              {nextPlannedWorkout.objective}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Aucun objectif précis ajouté pour le moment.
            </p>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            to="/planning"
            className="inline-flex justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
          >
            Voir le planning
          </Link>

          <Link
            to="/workouts/new"
            className="inline-flex justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-100 transition hover:bg-white/10"
          >
            Ajouter une séance
          </Link>
        </div>
      </div>
    </section>
  )
}

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-slate-100">
      {children}
    </span>
  )
}

function getNextPlannedWorkout(plannedWorkouts: PlannedWorkout[]) {
  const today = getTodayDate()

  const sortedPlannedWorkouts = [...plannedWorkouts].sort((a, b) => {
    return (
      getDateFromString(a.date).getTime() -
      getDateFromString(b.date).getTime()
    )
  })

  const upcomingWorkout = sortedPlannedWorkouts.find((plannedWorkout) => {
    return getDateFromString(plannedWorkout.date).getTime() >= today.getTime()
  })

  if (upcomingWorkout) {
    return upcomingWorkout
  }

  return sortedPlannedWorkouts.at(-1)
}

function getTimeStatus(date: string) {
  const today = getTodayDate()
  const plannedDate = getDateFromString(date)

  const differenceInDays = Math.round(
    (plannedDate.getTime() - today.getTime()) / 86_400_000,
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(getDateFromString(date))
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