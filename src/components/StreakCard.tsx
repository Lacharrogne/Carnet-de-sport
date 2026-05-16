import { Link } from 'react-router-dom'

import { getStreakStats } from '../services/streakService'
import type { Workout } from '../types/workout'

type StreakCardProps = {
  workouts: Workout[]
}

export default function StreakCard({ workouts }: StreakCardProps) {
  const streakStats = getStreakStats(workouts)

  return (
    <section className="mt-8 rounded-[2rem] border border-orange-400/20 bg-orange-400/10 p-6 shadow-2xl shadow-orange-400/10">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-300">
            Série active
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            {getTitle(streakStats.currentStreak)}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            {getDescription(streakStats.currentStreak, streakStats.hasWorkoutToday)}
          </p>

          <p className="mt-5 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white">
            {streakStats.lastWorkoutLabel}
          </p>
        </div>

        <div className="rounded-[2rem] border border-orange-400/20 bg-slate-950/40 p-5">
          <p className="text-sm text-orange-300">
            Série actuelle
          </p>

          <div className="mt-2 flex items-end gap-3">
            <p className="text-6xl font-black text-white">
              {streakStats.currentStreak}
            </p>

            <p className="pb-2 text-lg font-bold text-slate-300">
              jour{streakStats.currentStreak > 1 ? 's' : ''}
            </p>
          </div>

          <Link
            to="/workouts/new"
            className="mt-5 inline-flex w-full justify-center rounded-full bg-orange-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-orange-300"
          >
            Ajouter une séance
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
    return 'Ajoute une séance aujourd’hui pour relancer ta dynamique.'
  }

  if (hasWorkoutToday) {
    return 'Bien joué, ta séance du jour est enregistrée. Tu gardes ta dynamique active.'
  }

  return 'Tu peux encore sauver ta série aujourd’hui avec une courte séance.'
}