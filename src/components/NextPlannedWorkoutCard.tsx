import { Link } from 'react-router-dom'
import { CalendarDays, Plus } from 'lucide-react'

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
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Prochaine séance
        </p>

        <h2 className="mt-2 text-xl font-bold leading-tight text-slate-900">
          Rien de prévu.
        </h2>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          Planifie ta prochaine séance pour garder une direction claire.
        </p>

        <Link
          to="/planning"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <CalendarDays className="h-4 w-4" />
          Planifier une séance
        </Link>
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
        'rounded-3xl border p-5 shadow-sm sm:p-6',
        isLate
          ? 'border-amber-200 bg-amber-50'
          : 'border-emerald-200 bg-emerald-50',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={[
              'text-xs font-semibold uppercase tracking-wide',
              isLate ? 'text-amber-600' : 'text-emerald-600',
            ].join(' ')}
          >
            {isLate ? 'Séance à rattraper' : 'Prochaine séance'}
          </p>

          <h2 className="mt-2 line-clamp-2 text-xl font-bold leading-tight text-slate-900">
            {nextPlannedWorkout.title}
          </h2>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl">
          {sportCategory?.emoji ?? '🏃'}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <InfoPill>{sportCategory?.label ?? nextPlannedWorkout.category}</InfoPill>
        <InfoPill>{formatDuration(nextPlannedWorkout.duration)}</InfoPill>
        <InfoPill>{formatDate(nextPlannedWorkout.date)}</InfoPill>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Statut
            </p>

            <p className="mt-0.5 text-lg font-bold text-slate-900">{status}</p>
          </div>

          <p
            className={[
              'rounded-full px-3 py-1 text-xs font-semibold',
              isLate
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700',
            ].join(' ')}
          >
            À venir
          </p>
        </div>

        {nextPlannedWorkout.objective ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {nextPlannedWorkout.objective}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Aucun objectif précis ajouté pour le moment.
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          to="/planning"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <CalendarDays className="h-4 w-4" />
          Planning
        </Link>

        <Link
          to="/workouts/new"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>
    </section>
  )
}

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  )
}

function getNextPlannedWorkout(plannedWorkouts: PlannedWorkout[]) {
  const today = getTodayDate()

  const sortedPlannedWorkouts = [...plannedWorkouts].sort((a, b) => {
    return (
      getDateFromString(a.date).getTime() - getDateFromString(b.date).getTime()
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
