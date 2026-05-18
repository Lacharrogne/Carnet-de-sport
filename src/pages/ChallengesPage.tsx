import { getChallenges } from '../services/challengeService'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

type ChallengesPageProps = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
}

type Challenge = ReturnType<typeof getChallenges>[number]

function getProgressPercent(progress: number, target: number) {
  if (target <= 0) {
    return 0
  }

  return Math.min(Math.round((progress / target) * 100), 100)
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progressPercent = getProgressPercent(
    challenge.progress,
    challenge.target,
  )

  return (
    <article
      className={`rounded-[2rem] border p-6 transition ${
        challenge.unlocked
          ? 'border-emerald-400/20 bg-emerald-400/10 shadow-2xl shadow-emerald-400/5'
          : 'border-white/10 bg-white/[0.04] opacity-70'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-4xl">{challenge.icon}</p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            challenge.unlocked
              ? 'bg-emerald-400 text-slate-950'
              : 'bg-white/10 text-slate-300'
          }`}
        >
          {challenge.unlocked ? 'Débloqué' : 'En cours'}
        </span>
      </div>

      <h2 className="mt-6 text-2xl font-black text-white">
        {challenge.title}
      </h2>

      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
        {challenge.description}
      </p>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-slate-300">
            {challenge.progress} / {challenge.target} {challenge.unit}
          </p>

          <p className="text-sm font-black text-emerald-300">
            +{challenge.xp} XP
          </p>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-950">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>
    </article>
  )
}

export default function ChallengesPage({
  workouts,
  plannedWorkouts,
  weeklyGoal,
}: ChallengesPageProps) {
  const challenges = getChallenges({
    workouts,
    plannedWorkouts,
    weeklyGoal,
  })

  const unlockedChallenges = challenges.filter((challenge) => {
    return challenge.unlocked
  })

  const totalXp = unlockedChallenges.reduce((total, challenge) => {
    return total + challenge.xp
  }, 0)

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Défis
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                Transforme ton sport en jeu.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Les défis donnent des objectifs courts, visibles et motivants
                pour te pousser à bouger régulièrement.
              </p>
            </div>

            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Progression
              </p>

              <p className="mt-4 text-5xl font-black text-white">
                {unlockedChallenges.length}/{challenges.length}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                défis débloqués · {totalXp} XP gagnés
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </section>
      </section>
    </main>
  )
}