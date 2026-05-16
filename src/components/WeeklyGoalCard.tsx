import { useState } from 'react'

import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

type WeeklyGoalCardProps = {
  workouts: Workout[]
  weeklyGoal: WeeklyGoal
  onWeeklyGoalChange: (weeklyGoal: WeeklyGoal) => void
}

export default function WeeklyGoalCard({
  workouts,
  weeklyGoal,
  onWeeklyGoalChange,
}: WeeklyGoalCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [targetMinutes, setTargetMinutes] = useState(
    String(weeklyGoal.targetMinutes)
  )

  const weeklyMinutes = getCurrentWeekDuration(workouts)
  const progress = Math.min(
    Math.round((weeklyMinutes / weeklyGoal.targetMinutes) * 100),
    100
  )

  const remainingMinutes = Math.max(weeklyGoal.targetMinutes - weeklyMinutes, 0)
  const isCompleted = weeklyMinutes >= weeklyGoal.targetMinutes

  const handleSave = () => {
    const newTarget = Number(targetMinutes)

    if (!targetMinutes || newTarget <= 0) {
      alert('Ajoute un objectif valide.')
      return
    }

    onWeeklyGoalChange({
      targetMinutes: newTarget,
    })

    setIsEditing(false)
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
            Objectif hebdomadaire
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            {isCompleted
              ? 'Objectif validé cette semaine.'
              : 'Garde ta série active.'}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {getMotivationText(isCompleted, remainingMinutes)}
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-300">
                {weeklyMinutes} / {weeklyGoal.targetMinutes} min
              </p>

              <p className="text-sm font-black text-emerald-300">
                {progress} %
              </p>
            </div>

            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-950">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
          {isEditing ? (
            <div>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-200">
                  Nouvel objectif en minutes
                </span>

                <input
                  type="number"
                  min="1"
                  value={targetMinutes}
                  onChange={(event) => setTargetMinutes(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
                />
              </label>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 rounded-full bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                >
                  Sauvegarder
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetMinutes(String(weeklyGoal.targetMinutes))
                    setIsEditing(false)
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-emerald-300">
                Objectif actuel
              </p>

              <p className="mt-1 text-4xl font-black text-white">
                {weeklyGoal.targetMinutes} min
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                À atteindre entre lundi et dimanche.
              </p>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-5 w-full rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/20"
              >
                Modifier l’objectif
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function getCurrentWeekDuration(workouts: Workout[]) {
  const today = new Date()
  const day = today.getDay()
  const differenceToMonday = day === 0 ? -6 : 1 - day

  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() + differenceToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return workouts.reduce((total, workout) => {
    const workoutDate = new Date(`${workout.date}T00:00:00`)

    if (workoutDate >= startOfWeek && workoutDate <= endOfWeek) {
      return total + workout.duration
    }

    return total
  }, 0)
}

function getMotivationText(isCompleted: boolean, remainingMinutes: number) {
  if (isCompleted) {
    return 'Bien joué. Tu as rempli ton objectif hebdomadaire, tu peux maintenant viser le bonus ou récupérer intelligemment.'
  }

  if (remainingMinutes <= 30) {
    return `Il ne te reste que ${remainingMinutes} minutes. Une petite séance suffit pour valider la semaine.`
  }

  return `Il te reste ${remainingMinutes} minutes pour atteindre ton objectif. Avance un peu, même une courte séance compte.`
}