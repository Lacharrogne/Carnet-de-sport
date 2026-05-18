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
    <section className="relative h-full overflow-hidden rounded-[2rem] border border-orange-400/20 bg-orange-400/10 p-6 shadow-2xl shadow-orange-400/10 sm:p-7">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between gap-7">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-300">
                Série active
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight text-white">
                {getTitle(currentStreak)}
              </h2>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-orange-400/20 bg-orange-400/10 text-4xl">
              🔥
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            {getDescription(currentStreak, streakStats.hasWorkoutToday)}
          </p>

          <div className="mt-5 inline-flex rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-bold text-white">
            {streakStats.lastWorkoutLabel}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-orange-300">
                Série actuelle
              </p>

              <div className="mt-2 flex items-end gap-3">
                <p className="text-6xl font-black leading-none text-white">
                  {currentStreak}
                </p>

                <p className="pb-1 text-lg font-bold text-slate-300">
                  jour{currentStreak > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-right">
              <p className="text-xs font-bold text-orange-300">
                Objectif
              </p>

              <p className="mt-1 text-xl font-black text-white">
                7 jours
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-300">
                Progression de la série
              </p>

              <p className="text-sm font-black text-orange-300">
                {streakProgress}%
              </p>
            </div>

            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-950">
              <div
                className="h-full rounded-full bg-orange-400 transition-all"
                style={{ width: `${streakProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/workouts/new"
            className="flex items-center justify-center rounded-full bg-orange-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-orange-300"
          >
            Ajouter une séance
          </Link>

          <Link
            to="/progress"
            className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
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