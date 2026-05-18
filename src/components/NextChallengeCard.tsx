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

  const unlockedChallenges = challenges.filter((challenge) => {
    return challenge.unlocked
  })

  const activeChallenges = challenges
    .filter((challenge) => {
      return !challenge.unlocked
    })
    .sort((a, b) => {
      const progressA = a.target > 0 ? a.progress / a.target : 0
      const progressB = b.target > 0 ? b.progress / b.target : 0

      return progressB - progressA
    })

  const nextChallenge = activeChallenges[0]

  if (!nextChallenge) {
    return (
      <section className="relative h-full overflow-hidden rounded-[2rem] border border-emerald-400/25 bg-emerald-400/10 p-6 shadow-2xl shadow-emerald-400/10 sm:p-7">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between gap-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Prochain défi
            </p>

            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-4xl">
                🏆
              </div>

              <div>
                <h2 className="text-3xl font-black leading-tight text-white">
                  Tous les défis sont débloqués.
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Tu as terminé tous les objectifs actuels. Il est temps d’ajouter
                  des défis plus ambitieux pour garder la motivation.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-sm font-bold text-slate-300">
              Défis validés
            </p>

            <p className="mt-2 text-4xl font-black text-white">
              {unlockedChallenges.length}/{challenges.length}
            </p>

            <Link
              to="/challenges"
              className="mt-5 inline-flex w-full justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
            >
              Voir les défis
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const progressPercent =
    nextChallenge.target > 0
      ? Math.min(
          Math.round((nextChallenge.progress / nextChallenge.target) * 100),
          100,
        )
      : 0

  const remainingProgress = Math.max(
    nextChallenge.target - nextChallenge.progress,
    0,
  )

  return (
    <section className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-7">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Prochain défi
            </p>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
              {progressPercent}%
            </span>
          </div>

          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-4xl">
              {nextChallenge.icon}
            </div>

            <div className="min-w-0">
              <h2 className="text-3xl font-black leading-tight text-white">
                {nextChallenge.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {nextChallenge.description}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-300">
                Progression
              </p>

              <p className="text-sm font-black text-emerald-300">
                {nextChallenge.progress} / {nextChallenge.target}{' '}
                {nextChallenge.unit}
              </p>
            </div>

            <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-950">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Encore{' '}
              <span className="font-black text-white">
                {remainingProgress} {nextChallenge.unit}
              </span>{' '}
              pour débloquer ce défi.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm font-bold text-emerald-300">
              Récompense
            </p>

            <p className="mt-2 text-3xl font-black text-white">
              +{nextChallenge.xp} XP
            </p>
          </div>

          <Link
            to="/challenges"
            className="flex items-center justify-center rounded-3xl bg-emerald-400 px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
          >
            Voir tous les défis
          </Link>
        </div>
      </div>
    </section>
  )
}