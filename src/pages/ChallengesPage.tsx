import { getChallenges } from '../services/challengeService'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

type ChallengesPageProps = {
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

function getLevelFromXp(totalXp: number) {
  const xpPerLevel = 500
  const level = Math.floor(totalXp / xpPerLevel) + 1
  const currentLevelXp = totalXp % xpPerLevel
  const nextLevelXp = xpPerLevel
  const percent = getProgressPercent(currentLevelXp, nextLevelXp)

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    percent,
  }
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

  const ongoingChallenges = challenges
    .filter((challenge) => {
      return !challenge.unlocked
    })
    .sort((a, b) => {
      return (
        getProgressPercent(b.progress, b.target) -
        getProgressPercent(a.progress, a.target)
      )
    })

  const highlightedChallenges = ongoingChallenges.filter((challenge) => {
    return getProgressPercent(challenge.progress, challenge.target) >= 70
  })

  const totalXp = unlockedChallenges.reduce((total, challenge) => {
    return total + challenge.xp
  }, 0)

  const levelInfo = getLevelFromXp(totalXp)

  const completionPercent = getProgressPercent(
    unlockedChallenges.length,
    challenges.length,
  )

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Défis
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                Transforme ton sport en jeu.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Débloque des objectifs, gagne de l’XP et garde une vraie
                motivation semaine après semaine.
              </p>
            </div>

            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                    Niveau actuel
                  </p>

                  <p className="mt-4 text-6xl font-black text-white">
                    {levelInfo.level}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-right">
                  <p className="text-sm font-bold text-slate-400">XP total</p>
                  <p className="text-2xl font-black text-white">{totalXp}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold text-slate-300">
                    {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
                  </p>

                  <p className="text-sm font-black text-emerald-300">
                    Niveau {levelInfo.level + 1}
                  </p>
                </div>

                <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-950">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{
                      width: `${levelInfo.percent}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              Défis débloqués
            </p>

            <p className="mt-4 text-5xl font-black text-white">
              {unlockedChallenges.length}/{challenges.length}
            </p>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-950">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: `${completionPercent}%`,
                }}
              />
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              Défis en cours
            </p>

            <p className="mt-4 text-5xl font-black text-white">
              {ongoingChallenges.length}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Continue tes séances pour les débloquer progressivement.
            </p>
          </article>

          <article className="rounded-[2rem] border border-orange-300/20 bg-orange-400/10 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-200">
              Presque terminés
            </p>

            <p className="mt-4 text-5xl font-black text-white">
              {highlightedChallenges.length}
            </p>

            <p className="mt-3 text-sm leading-6 text-orange-100/80">
              Les défis à finir en priorité pour gagner rapidement de l’XP.
            </p>
          </article>
        </section>

        {highlightedChallenges.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-orange-300/20 bg-orange-400/10 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-200">
                  Priorité
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Défis presque terminés
                </h2>
              </div>

              <p className="text-sm font-bold text-orange-100/80">
                Termine-les pour débloquer vite de l’XP.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {highlightedChallenges.map((challenge) => {
                const percent = getProgressPercent(
                  challenge.progress,
                  challenge.target,
                )

                return (
                  <article
                    key={challenge.id}
                    className="rounded-[1.5rem] border border-orange-300/20 bg-slate-950/30 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-4xl">{challenge.icon}</p>

                      <span className="rounded-full bg-orange-300 px-3 py-1 text-xs font-black text-slate-950">
                        {percent}%
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-black text-white">
                      {challenge.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-orange-100/80">
                      {challenge.progress} / {challenge.target}{' '}
                      {challenge.unit}
                    </p>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-950">
                      <div
                        className="h-full rounded-full bg-orange-300"
                        style={{
                          width: `${percent}%`,
                        }}
                      />
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Collection
              </p>

              <h2 className="mt-2 text-3xl font-black text-white">
                Tous les défis
              </h2>
            </div>

            <p className="text-sm font-bold text-slate-400">
              {unlockedChallenges.length} débloqués · {ongoingChallenges.length}{' '}
              en cours
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[...unlockedChallenges, ...ongoingChallenges].map((challenge) => {
              const percent = getProgressPercent(
                challenge.progress,
                challenge.target,
              )

              return (
                <article
                  key={challenge.id}
                  className={`rounded-[2rem] border p-6 transition ${
                    challenge.unlocked
                      ? 'border-emerald-400/20 bg-emerald-400/10 shadow-2xl shadow-emerald-400/5'
                      : 'border-white/10 bg-white/[0.04] opacity-80'
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

                  <h3 className="mt-6 text-2xl font-black text-white">
                    {challenge.title}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                    {challenge.description}
                  </p>

                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-slate-300">
                        {challenge.progress} / {challenge.target}{' '}
                        {challenge.unit}
                      </p>

                      <p className="text-sm font-black text-emerald-300">
                        +{challenge.xp} XP
                      </p>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-950">
                      <div
                        className={`h-full rounded-full transition-all ${
                          challenge.unlocked
                            ? 'bg-emerald-400'
                            : 'bg-slate-500'
                        }`}
                        style={{
                          width: `${percent}%`,
                        }}
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </section>
    </main>
  )
}