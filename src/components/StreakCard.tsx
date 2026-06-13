import { Link } from 'react-router-dom'

import { getStreakStats } from '../services/streakService'
import type { Workout } from '../types/workout'

type StreakCardProps = {
  workouts: Workout[]
}

export default function StreakCard({ workouts }: StreakCardProps) {
  const streakStats = getStreakStats(workouts)

  const currentStreak = streakStats.currentStreak
  const streakProgress = Math.min(Math.round((currentStreak / 7) * 100), 100)

  return (
    <section className="relative h-full overflow-hidden rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-7">
      <div className="relative flex h-full flex-col justify-between gap-7">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-amber-600">
                Série active
              </p>

              <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900">
                {getTitle(currentStreak)}
              </h2>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 text-4xl">
              🔥
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            {getDescription(currentStreak, streakStats.hasWorkoutToday)}
          </p>

          <div className="mt-5 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900">
            {streakStats.lastWorkoutLabel}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-amber-600">
                Série actuelle
              </p>

              <div className="mt-2 flex items-end gap-3">
                <p className="text-6xl font-bold leading-none text-slate-900">
                  {currentStreak}
                </p>

                <p className="pb-1 text-lg font-bold text-slate-600">
                  jour{currentStreak > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-right">
              <p className="text-xs font-bold text-amber-600">
                Objectif
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                7 jours
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-600">
                Progression de la série
              </p>

              <p className="text-sm font-bold text-amber-600">
                {streakProgress}%
              </p>
            </div>

            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${streakProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/workouts/new"
            className="flex items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
          >
            Ajouter une séance
          </Link>

          <Link
            to="/progress"
            className="flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
          >
            Voir progression
          </Link>
        </div>
      </div>
    </section>
  )
}

function getTitle(currentStreak: number) {
  if (currentStreak === 0) {
    return 'Relance ta série.'
  }

  if (currentStreak === 1) {
    return 'La série commence.'
  }

  return `${currentStreak} jours de suite.`
}

function getDescription(currentStreak: number, hasWorkoutToday: boolean) {
  if (currentStreak === 0) {
    return 'Ajoute une séance aujourd’hui pour relancer ta dynamique et remettre la machine en route.'
  }

  if (hasWorkoutToday) {
    return 'Bien joué, ta séance du jour est enregistrée. Ta série reste active et ton rythme continue.'
  }

  if (currentStreak >= 7) {
    return 'Tu as une vraie dynamique. Une petite séance aujourd’hui suffit pour ne pas casser ta série.'
  }

  return 'Tu peux encore sauver ta série aujourd’hui avec une séance courte, même simple.'
}