import { getChallenges } from '../services/challengeService'
import { getSportProfileXp } from '../services/xpService'
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

  const sportProfileXp = getSportProfileXp({
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

  const highlightedChallenges = ongoingChallenges
    .filter((challenge) => {
      return getProgressPercent(challenge.progress, challenge.target) >= 70
    })
    .slice(0, 3)

  const completionPercent = getProgressPercent(
    unlockedChallenges.length,
    challenges.length,
  )

  const nextChallenge = ongoingChallenges[0] ?? null

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 via-white/[0.04] to-sky-400/10 p-5 shadow-2xl shadow-black/25 sm:p-7 lg:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Défis
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                Transforme ton sport en jeu.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Débloque des objectifs, gagne de l’XP et garde une motivation
                claire séance après séance.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroStat
                  label="Défis débloqués"
                  value={`${unlockedChallenges.length}/${challenges.length}`}
                />

                <HeroStat
                  label="XP défis"
                  value={`+${sportProfileXp.details.challengeXp}`}
                />

                <HeroStat
                  label="Presque terminés"
                  value={highlightedChallenges.length}
                />
              </div>
            </div>

            <LevelCard sportProfileXp={sportProfileXp} />
          </div>
        </header>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                Progression des défis
              </p>

              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Collection complétée à {completionPercent}%
              </h2>
            </div>

            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-200">
              {unlockedChallenges.length} débloqué
              {unlockedChallenges.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-950">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{
                width: `${completionPercent}%`,
              }}
            />
          </div>

          {nextChallenge ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/45 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Prochain défi conseillé
              </p>

              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <p className="text-4xl">{nextChallenge.icon}</p>

                  <div>
                    <h3 className="text-xl font-black text-white">
                      {nextChallenge.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {nextChallenge.progress} / {nextChallenge.target}{' '}
                      {nextChallenge.unit} · +{nextChallenge.xp} XP
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-200">
                  {getProgressPercent(nextChallenge.progress, nextChallenge.target)}
                  %
                </span>
              </div>
            </div>
          ) : null}
        </section>

        {highlightedChallenges.length > 0 ? (
          <section className="mt-6 rounded-[2rem] border border-orange-300/20 bg-orange-400/10 p-5 shadow-2xl shadow-black/20 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">
                  Priorité
                </p>

                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  Défis presque terminés
                </h2>
              </div>

              <p className="text-sm font-bold text-orange-100/80">
                À finir pour gagner rapidement de l’XP.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {highlightedChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  variant="highlight"
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                Collection
              </p>

              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Tous les défis
              </h2>
            </div>

            <p className="text-sm font-bold text-slate-400">
              {unlockedChallenges.length} débloqué
              {unlockedChallenges.length > 1 ? 's' : ''} ·{' '}
              {ongoingChallenges.length} en cours
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...unlockedChallenges, ...ongoingChallenges].map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

function LevelCard({
  sportProfileXp,
}: {
  sportProfileXp: ReturnType<typeof getSportProfileXp>
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Niveau actuel
          </p>

          <p className="mt-3 text-6xl font-black text-white">
            {sportProfileXp.level}
          </p>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300">
          ⚡ XP
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-950">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all"
          style={{
            width: `${sportProfileXp.levelProgressPercent}%`,
          }}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        {sportProfileXp.currentLevelXp} / {sportProfileXp.xpPerLevel} XP ·
        encore {sportProfileXp.xpToNextLevel} XP avant le niveau suivant.
      </p>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-2xl font-black text-white">
        {value}
      </p>
    </div>
  )
}

function ChallengeCard({
  challenge,
  variant = 'default',
}: {
  challenge: ReturnType<typeof getChallenges>[number]
  variant?: 'default' | 'highlight'
}) {
  const percent = getProgressPercent(challenge.progress, challenge.target)

  const cardClassName = challenge.unlocked
    ? 'border-emerald-400/20 bg-emerald-400/10 shadow-2xl shadow-emerald-400/5'
    : variant === 'highlight'
      ? 'border-orange-300/20 bg-slate-950/35'
      : 'border-white/10 bg-white/[0.04] opacity-85'

  const progressClassName = challenge.unlocked
    ? 'bg-emerald-400'
    : variant === 'highlight'
      ? 'bg-orange-300'
      : 'bg-slate-500'

  return (
    <article className={`rounded-[2rem] border p-5 transition ${cardClassName}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-4xl">{challenge.icon}</p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            challenge.unlocked
              ? 'bg-emerald-400 text-slate-950'
              : variant === 'highlight'
                ? 'bg-orange-300 text-slate-950'
                : 'bg-white/10 text-slate-300'
          }`}
        >
          {challenge.unlocked ? 'Débloqué' : `${percent}%`}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-black text-white">
        {challenge.title}
      </h3>

      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
        {challenge.description}
      </p>

      <div className="mt-5">
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
            className={`h-full rounded-full transition-all ${progressClassName}`}
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>
    </article>
  )
}