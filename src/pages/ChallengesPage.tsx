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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm sm:p-7 lg:p-8">
          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
                Défis
              </p>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
                Transforme ton sport en jeu.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
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

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Progression des défis
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Collection complétée à {completionPercent}%
              </h2>
            </div>

            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
              {unlockedChallenges.length} débloqué
              {unlockedChallenges.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${completionPercent}%`,
              }}
            />
          </div>

          {nextChallenge ? (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Prochain défi conseillé
              </p>

              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <p className="text-4xl">{nextChallenge.icon}</p>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {nextChallenge.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {nextChallenge.progress} / {nextChallenge.target}{' '}
                      {nextChallenge.unit} · +{nextChallenge.xp} XP
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                  {getProgressPercent(nextChallenge.progress, nextChallenge.target)}
                  %
                </span>
              </div>
            </div>
          ) : null}
        </section>

        {highlightedChallenges.length > 0 ? (
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                  Priorité
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Défis presque terminés
                </h2>
              </div>

              <p className="text-sm font-bold text-amber-800">
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
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Collection
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Tous les défis
              </h2>
            </div>

            <p className="text-sm font-bold text-slate-500">
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Niveau actuel
          </p>

          <p className="mt-3 text-6xl font-bold text-slate-900">
            {sportProfileXp.level}
          </p>
        </div>

        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600">
          ⚡ XP
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{
            width: `${sportProfileXp.levelProgressPercent}%`,
          }}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {sportProfileXp.currentLevelXp} / {sportProfileXp.xpPerLevel} XP ·
        encore {sportProfileXp.xpToNextLevel} XP avant le niveau suivant.
      </p>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-2xl font-bold text-slate-900">
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
    ? 'border-emerald-200 bg-emerald-50 shadow-sm'
    : variant === 'highlight'
      ? 'border-amber-200 bg-amber-50'
      : 'border-slate-200 bg-white opacity-85'

  const progressClassName = challenge.unlocked
    ? 'bg-emerald-500'
    : variant === 'highlight'
      ? 'bg-amber-500'
      : 'bg-slate-400'

  return (
    <article className={`rounded-3xl border p-5 transition ${cardClassName}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-4xl">{challenge.icon}</p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            challenge.unlocked
              ? 'bg-emerald-600 text-white'
              : variant === 'highlight'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600'
          }`}
        >
          {challenge.unlocked ? 'Débloqué' : `${percent}%`}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900">
        {challenge.title}
      </h3>

      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
        {challenge.description}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-slate-600">
            {challenge.progress} / {challenge.target} {challenge.unit}
          </p>

          <p className="text-sm font-bold text-emerald-600">
            +{challenge.xp} XP
          </p>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
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