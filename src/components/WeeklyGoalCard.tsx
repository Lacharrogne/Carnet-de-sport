import { useState } from 'react'
import { Target } from 'lucide-react'

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
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Target className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Objectif hebdomadaire
            </p>

            <h2 className="mt-0.5 text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              {isCompleted
                ? 'Objectif validé cette semaine.'
                : 'Garde ta dynamique.'}
            </h2>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={handleStartEditing}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Modifier
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
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
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Ex : 180"
            />
          </label>

          {errorMessage ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {errorMessage}
            </p>
          ) : null}

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Un bon objectif est motivant mais atteignable. Commence simple, puis
            augmente progressivement.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Sauvegarder
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Réalisé cette semaine
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {weeklyMinutes} min
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-slate-500">Objectif</p>

              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {weeklyGoal.targetMinutes} min
              </p>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-500">
              {progress}% · Lundi → Dimanche
            </span>

            <span
              className={[
                'rounded-full px-3 py-1 text-xs font-semibold',
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600',
              ].join(' ')}
            >
              {isCompleted
                ? `Bonus : +${bonusMinutes} min`
                : `Reste : ${remainingMinutes} min`}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            {getMotivationText(isCompleted, remainingMinutes, bonusMinutes)}
          </p>
        </div>
      )}
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
