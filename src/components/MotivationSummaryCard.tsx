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
    <section className="rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 via-white/[0.04] to-cyan-400/10 p-6 shadow-2xl shadow-emerald-400/10">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
            Résumé dopamine
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            Ton profil sportif prend forme.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Chaque séance, défi et mission alimente ton niveau. Le but est de
            rendre tes efforts visibles pour garder l’envie de bouger.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Niveau</p>

              <p className="mt-1 text-3xl font-black text-white">
                {sportProfileXp.level}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">XP total</p>

              <p className="mt-1 text-3xl font-black text-white">
                {sportProfileXp.totalXp}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Défis débloqués</p>

              <p className="mt-1 text-3xl font-black text-white">
                {unlockedChallenges.length}/{challenges.length}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-300">
                Progression du niveau
              </p>

              <p className="text-sm font-black text-emerald-300">
                {sportProfileXp.currentLevelXp} / {sportProfileXp.xpPerLevel} XP
              </p>
            </div>

            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-950">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{
                  width: `${sportProfileXp.levelProgressPercent}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-400">
              Encore {sportProfileXp.xpToNextLevel} XP pour atteindre le niveau{' '}
              {sportProfileXp.level + 1}.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
            À viser maintenant
          </p>

          {nextChallenge ? (
            <>
              <div className="mt-5 flex items-center gap-4">
                <p className="text-5xl">{nextChallenge.icon}</p>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    {nextChallenge.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {nextChallenge.progress} / {nextChallenge.target}{' '}
                    {nextChallenge.unit}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-300">
                C’est le défi le plus proche d’être terminé. Une petite action
                peut suffire à débloquer de l’XP.
              </p>

              <Link
                to="/challenges"
                className="mt-5 inline-flex w-full justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Voir les défis
              </Link>
            </>
          ) : (
            <>
              <p className="mt-5 text-2xl font-black text-white">
                Tous les défis sont terminés.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-300">
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