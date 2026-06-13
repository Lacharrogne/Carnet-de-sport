import { Link } from 'react-router-dom'

import { getChallenges } from '../services/challengeService'
import { getSportProfileXp } from '../services/xpService'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

type MotivationSummaryCardProps = {
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

export default function MotivationSummaryCard({
  workouts,
  plannedWorkouts,
  weeklyGoal,
}: MotivationSummaryCardProps) {
  const challenges = getChallenges({
    workouts,
    plannedWorkouts,
    weeklyGoal,
  })

  const sportProfileXp = getSportProfileXp({
    workouts,
    plannedWorkouts,
    weeklyGoal,
  })

  const unlockedChallenges = challenges.filter((challenge) => {
    return challenge.unlocked
  })

  const nextChallenge = challenges
    .filter((challenge) => {
      return !challenge.unlocked
    })
    .sort((a, b) => {
      return (
        getProgressPercent(b.progress, b.target) -
        getProgressPercent(a.progress, a.target)
      )
    })[0]

  return (
    <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Résumé dopamine
          </p>

          <h2 className="mt-3 text-4xl font-bold text-slate-900">
            Ton profil sportif prend forme.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Chaque séance, défi et mission alimente ton niveau. Le but est de
            rendre tes efforts visibles pour garder l’envie de bouger.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Niveau</p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {sportProfileXp.level}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">XP total</p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {sportProfileXp.totalXp}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Défis débloqués</p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {unlockedChallenges.length}/{challenges.length}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-600">
                Progression du niveau
              </p>

              <p className="text-sm font-bold text-emerald-600">
                {sportProfileXp.currentLevelXp} / {sportProfileXp.xpPerLevel} XP
              </p>
            </div>

            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${sportProfileXp.levelProgressPercent}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Encore {sportProfileXp.xpToNextLevel} XP pour atteindre le niveau{' '}
              {sportProfileXp.level + 1}.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-sky-700">
            À viser maintenant
          </p>

          {nextChallenge ? (
            <>
              <div className="mt-5 flex items-center gap-4">
                <p className="text-5xl">{nextChallenge.icon}</p>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {nextChallenge.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {nextChallenge.progress} / {nextChallenge.target}{' '}
                    {nextChallenge.unit}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-600">
                C’est le défi le plus proche d’être terminé. Une petite action
                peut suffire à débloquer de l’XP.
              </p>

              <Link
                to="/challenges"
                className="mt-5 inline-flex w-full justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Voir les défis
              </Link>
            </>
          ) : (
            <>
              <p className="mt-5 text-2xl font-bold text-slate-900">
                Tous les défis sont terminés.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Tu as débloqué tous les objectifs actuels. Il faudra bientôt
                ajouter des défis plus ambitieux.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}