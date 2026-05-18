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
    String(weeklyGoal.targetMinutes),
  )
  const [errorMessage, setErrorMessage] = useState('')

  const weeklyMinutes = getCurrentWeekDuration(workouts)
  const progress =
    weeklyGoal.targetMinutes > 0
      ? Math.min(
          Math.round((weeklyMinutes / weeklyGoal.targetMinutes) * 100),
          100,
        )
      : 0

  const remainingMinutes = Math.max(weeklyGoal.targetMinutes - weeklyMinutes, 0)
  const bonusMinutes = Math.max(weeklyMinutes - weeklyGoal.targetMinutes, 0)
  const isCompleted = weeklyMinutes >= weeklyGoal.targetMinutes

  const handleStartEditing = () => {
    setTargetMinutes(String(weeklyGoal.targetMinutes))
    setErrorMessage('')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setTargetMinutes(String(weeklyGoal.targetMinutes))
    setErrorMessage('')
    setIsEditing(false)
  }

  const handleSave = () => {
    const newTarget = Number(targetMinutes)

    if (!targetMinutes || Number.isNaN(newTarget) || newTarget <= 0) {
      setErrorMessage('Ajoute un objectif supérieur à 0 minute.')
      return
    }

    onWeeklyGoalChange({
      targetMinutes: newTarget,
    })

    setErrorMessage('')
    setIsEditing(false)
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
        <div className="flex flex-col justify-between gap-7">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
                  Objectif hebdomadaire
                </p>

                <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                  {isCompleted
                    ? 'Objectif validé cette semaine.'
                    : 'Garde ta dynamique active.'}
                </h2>
              </div>

              <div
                className={`w-fit rounded-3xl border px-5 py-4 ${
                  isCompleted
                    ? 'border-emerald-400/25 bg-emerald-400/10'
                    : 'border-white/10 bg-slate-950/40'
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    isCompleted ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  Avancement
                </p>

                <p className="mt-1 text-3xl font-black text-white">
                  {progress}%
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              {getMotivationText(isCompleted, remainingMinutes, bonusMinutes)}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-300">
                  Temps réalisé cette semaine
                </p>

                <p className="mt-2 text-4xl font-black text-white">
                  {weeklyMinutes} min
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-slate-400">
                  Objectif
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-300">
                  {weeklyGoal.targetMinutes} min
                </p>
              </div>
            </div>

            <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-950">
              <div
                className={`h-full rounded-full transition-all ${
                  isCompleted ? 'bg-emerald-300' : 'bg-emerald-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                Lundi → Dimanche
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                {isCompleted
                  ? `Bonus : +${bonusMinutes} min`
                  : `Reste : ${remainingMinutes} min`}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-5 sm:p-6">
          {isEditing ? (
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                  Modifier l’objectif
                </p>

                <label className="mt-5 block space-y-2">
                  <span className="text-sm font-bold text-slate-200">
                    Nouvel objectif en minutes
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={targetMinutes}
                    onChange={(event) => {
                      setTargetMinutes(event.target.value)
                      setErrorMessage('')
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-lg font-black text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60"
                    placeholder="Ex : 180"
                  />
                </label>

                {errorMessage ? (
                  <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200">
                    {errorMessage}
                  </p>
                ) : null}

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Un bon objectif doit être motivant, mais atteignable. Tu peux
                  commencer simple puis augmenter progressivement.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                >
                  Sauvegarder
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-between gap-7">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                  Objectif actuel
                </p>

                <div className="mt-5 flex items-end gap-3">
                  <p className="text-6xl font-black leading-none text-white">
                    {weeklyGoal.targetMinutes}
                  </p>

                  <p className="pb-2 text-lg font-bold text-slate-300">
                    min
                  </p>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-300">
                  À atteindre entre lundi et dimanche. Même les petites séances
                  comptent dans ta progression.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartEditing}
                className="w-full rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/20"
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

function getMotivationText(
  isCompleted: boolean,
  remainingMinutes: number,
  bonusMinutes: number,
) {
  if (isCompleted) {
    if (bonusMinutes > 0) {
      return `Bien joué. Tu as dépassé ton objectif de ${bonusMinutes} minutes cette semaine.`
    }

    return 'Bien joué. Tu as rempli ton objectif hebdomadaire, tu peux maintenant viser le bonus ou récupérer intelligemment.'
  }

  if (remainingMinutes <= 30) {
    return `Il ne te reste que ${remainingMinutes} minutes. Une petite séance suffit pour valider la semaine.`
  }

  return `Il te reste ${remainingMinutes} minutes pour atteindre ton objectif. Avance un peu, même une courte séance compte.`
}