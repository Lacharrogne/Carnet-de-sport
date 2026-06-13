import { Link } from 'react-router-dom'

import { getChallenges } from '../services/challengeService'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

type NextChallengeCardProps = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
}

function getProgressPercent(progress: number, target: number) {
  if (target <= 0) {
    return 0
  }

  return Math.min(Math.round((progress / target) * 100), 100)
}

export default function NextChallengeCard({
  workouts,
  plannedWorkouts,
  weeklyGoal,
}: NextChallengeCardProps) {
  const challenges = getChallenges({
    workouts,
    plannedWorkouts,
    weeklyGoal,
  })

  const activeChallenges = challenges
    .filter((challenge) => {
      return !challenge.unlocked
    })
    .sort((a, b) => {
      return (
        getProgressPercent(b.progress, b.target) -
        getProgressPercent(a.progress, a.target)
      )
    })

  const nextChallenge = activeChallenges[0]

  if (!nextChallenge) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
              Prochain défi
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Tous les défis sont débloqués.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Tu as terminé tous les objectifs actuels. Il est temps d’ajouter
              des défis encore plus ambitieux.
            </p>
          </div>

          <Link
            to="/challenges"
            className="rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Voir les défis
          </Link>
        </div>
      </section>
    )
  }

  const progressPercent = getProgressPercent(
    nextChallenge.progress,
    nextChallenge.target,
  )

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Prochain défi
          </p>

          <div className="mt-4 flex items-center gap-4">
            <p className="text-5xl">{nextChallenge.icon}</p>

            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {nextChallenge.title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {nextChallenge.description}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-600">
                {nextChallenge.progress} / {nextChallenge.target}{' '}
                {nextChallenge.unit}
              </p>

              <p className="text-sm font-bold text-emerald-600">
                {progressPercent} %
              </p>
            </div>

            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-600">
            Récompense
          </p>

          <p className="mt-1 text-4xl font-bold text-slate-900">
            +{nextChallenge.xp} XP
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Termine ce défi pour faire progresser ton profil sportif.
          </p>

          <Link
            to="/challenges"
            className="mt-5 inline-flex w-full justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Voir tous les défis
          </Link>
        </div>
      </div>
    </section>
  )
}