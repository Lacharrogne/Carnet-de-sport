import { useMemo, type ReactNode } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import { getSportProfileXp } from '../services/xpService'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

type ProgressPageProps = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
  onBack: () => void
}

type Trophy = {
  icon: string
  title: string
  description: string
  unlocked: boolean
}

export default function ProgressPage({
  workouts,
  plannedWorkouts,
  weeklyGoal,
  onBack,
}: ProgressPageProps) {
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => {
      return (
        new Date(`${b.date}T00:00:00`).getTime() -
        new Date(`${a.date}T00:00:00`).getTime()
      )
    })
  }, [workouts])

  const sportProfileXp = useMemo(() => {
    return getSportProfileXp({
      workouts,
      plannedWorkouts,
      weeklyGoal,
    })
  }, [workouts, plannedWorkouts, weeklyGoal])

  const totalWorkouts = workouts.length

  const totalDuration = useMemo(() => {
    return workouts.reduce((total, workout) => {
      return total + workout.duration
    }, 0)
  }, [workouts])

  const recordCount = useMemo(() => {
    return workouts.filter((workout) => workout.trend === 'record').length
  }, [workouts])

  const progressCount = useMemo(() => {
    return workouts.filter((workout) => workout.trend === 'progress').length
  }, [workouts])

  const regressCount = useMemo(() => {
    return workouts.filter((workout) => workout.trend === 'regress').length
  }, [workouts])

  const averageDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

  const lastWorkout = sortedWorkouts[0] ?? null

  const lastSevenDaysWorkouts = useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    return workouts.filter((workout) => {
      const workoutDate = new Date(`${workout.date}T00:00:00`)

      return workoutDate >= sevenDaysAgo && workoutDate <= today
    })
  }, [workouts])

  const lastSevenDaysDuration = useMemo(() => {
    return lastSevenDaysWorkouts.reduce((total, workout) => {
      return total + workout.duration
    }, 0)
  }, [lastSevenDaysWorkouts])

  const categoryStats = useMemo(() => {
    return SPORT_CATEGORIES.map((category) => {
      const categoryWorkouts = workouts.filter((workout) => {
        return workout.category === category.id
      })

      const categoryDuration = categoryWorkouts.reduce((total, workout) => {
        return total + workout.duration
      }, 0)

      return {
        ...category,
        count: categoryWorkouts.length,
        duration: categoryDuration,
      }
    }).sort((a, b) => b.count - a.count)
  }, [workouts])

  const visibleCategoryStats = categoryStats.filter((category) => {
    return category.count > 0
  })

  const favoriteCategory = visibleCategoryStats[0] ?? null

  const trophies: Trophy[] = [
    {
      icon: '🌱',
      title: 'Premier pas',
      description: 'Ajouter sa première séance.',
      unlocked: totalWorkouts >= 1,
    },
    {
      icon: '🔥',
      title: 'Record personnel',
      description: 'Avoir au moins une séance record.',
      unlocked: recordCount >= 1,
    },
    {
      icon: '📈',
      title: 'En progression',
      description: 'Avoir au moins deux séances en progression.',
      unlocked: progressCount >= 2,
    },
    {
      icon: '⏱️',
      title: 'Plus de 3 heures',
      description: 'Atteindre 180 minutes d’activité.',
      unlocked: totalDuration >= 180,
    },
    {
      icon: '🏋️',
      title: 'Régulier',
      description: 'Enregistrer au moins cinq séances.',
      unlocked: totalWorkouts >= 5,
    },
    {
      icon: '👑',
      title: 'Machine lancée',
      description: 'Atteindre le niveau 5.',
      unlocked: sportProfileXp.level >= 5,
    },
  ]

  const unlockedTrophies = trophies.filter((trophy) => trophy.unlocked).length

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-200 transition hover:bg-white/10"
        >
          ← Retour au dashboard
        </button>

        <header className="relative overflow-hidden rounded-[2.5rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 via-white/[0.04] to-sky-400/10 p-8 shadow-2xl shadow-black/30">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
                Progression globale
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">
                Niveau {sportProfileXp.level}
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Ta progression est calculée avec tes séances, ta régularité,
                tes records, tes défis réussis et tes missions validées.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <HeroStat label="XP total" value={sportProfileXp.totalXp} />

                <HeroStat label="Séances" value={totalWorkouts} />

                <HeroStat label="Temps actif" value={`${totalDuration} min`} />

                <HeroStat
                  label="Trophées"
                  value={`${unlockedTrophies}/${trophies.length}`}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                    Niveau actuel
                  </p>

                  <p className="mt-3 text-7xl font-black text-white">
                    {sportProfileXp.level}
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300">
                  ⚡ XP
                </div>
              </div>

              <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-950">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{
                    width: `${sportProfileXp.levelProgressPercent}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {sportProfileXp.currentLevelXp} / {sportProfileXp.xpPerLevel} XP
                — encore {sportProfileXp.xpToNextLevel} XP avant le niveau
                suivant.
              </p>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            <Panel title="Détail de l’XP" accent="emerald">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <XpDetailCard
                  label="Séances"
                  value={sportProfileXp.details.workoutXp}
                  icon="🏃"
                />

                <XpDetailCard
                  label="Durée"
                  value={sportProfileXp.details.durationXp}
                  icon="⏱️"
                />

                <XpDetailCard
                  label="Records"
                  value={sportProfileXp.details.recordXp}
                  icon="🔥"
                />

                <XpDetailCard
                  label="Progression"
                  value={sportProfileXp.details.progressXp}
                  icon="📈"
                />

                <XpDetailCard
                  label="Défis réussis"
                  value={sportProfileXp.details.challengeXp}
                  icon="🎯"
                />

                <XpDetailCard
                  label="Missions validées"
                  value={sportProfileXp.details.missionXp}
                  icon="✅"
                />
              </div>
            </Panel>

            <Panel title="Répartition par sport">
              {visibleCategoryStats.length > 0 ? (
                <div className="space-y-4">
                  {visibleCategoryStats.map((category) => {
                    const percent =
                      totalWorkouts > 0
                        ? Math.round((category.count / totalWorkouts) * 100)
                        : 0

                    return (
                      <div key={category.id}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <p className="font-black text-white">
                            {category.emoji} {category.label}
                          </p>

                          <p className="text-sm font-bold text-slate-400">
                            {percent}%
                          </p>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-950">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {category.count} séance
                          {category.count > 1 ? 's' : ''} ·{' '}
                          {category.duration} min
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyText text="Aucune séance enregistrée pour le moment." />
              )}
            </Panel>

            <Panel title="Trophées" accent="emerald">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {trophies.map((trophy) => (
                  <TrophyCard key={trophy.title} trophy={trophy} />
                ))}
              </div>
            </Panel>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <Panel title="Résumé rapide" accent="emerald">
              <div className="space-y-3">
                <InfoCard
                  title="Cette semaine"
                  value={`${lastSevenDaysDuration} min`}
                  description={`${lastSevenDaysWorkouts.length} séance${
                    lastSevenDaysWorkouts.length > 1 ? 's' : ''
                  } sur les 7 derniers jours.`}
                />

                <InfoCard
                  title="Dernière séance"
                  value={lastWorkout ? lastWorkout.title : 'Aucune'}
                  description={
                    lastWorkout
                      ? `${formatDate(lastWorkout.date)} · ${lastWorkout.duration} min`
                      : 'Ajoute une séance pour commencer ton suivi.'
                  }
                />

                <InfoCard
                  title="Sport dominant"
                  value={
                    favoriteCategory
                      ? `${favoriteCategory.emoji} ${favoriteCategory.label}`
                      : 'Aucun'
                  }
                  description={
                    favoriteCategory
                      ? `${favoriteCategory.count} séance${
                          favoriteCategory.count > 1 ? 's' : ''
                        } enregistrée${favoriteCategory.count > 1 ? 's' : ''}.`
                      : 'Aucune donnée pour le moment.'
                  }
                />
              </div>
            </Panel>

            <Panel title="Analyse rapide">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <CompactStat
                  label="Durée moyenne"
                  value={`${averageDuration} min`}
                />

                <CompactStat label="Records" value={`${recordCount} 🔥`} />

                <CompactStat
                  label="Progressions"
                  value={`${progressCount} 📈`}
                />

                <CompactStat
                  label="Régressions"
                  value={`${regressCount} 📉`}
                />
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="font-black text-white">Conseil automatique</p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {getAutomaticAdvice({
                    totalWorkouts,
                    progressCount,
                    regressCount,
                  })}
                </p>
              </div>
            </Panel>
          </aside>
        </div>
      </section>
    </main>
  )
}

function Panel({
  title,
  children,
  accent = 'default',
  className = '',
}: {
  title: string
  children: ReactNode
  accent?: 'default' | 'emerald' | 'sky'
  className?: string
}) {
  const titleColor =
    accent === 'emerald'
      ? 'text-emerald-300'
      : accent === 'sky'
        ? 'text-sky-300'
        : 'text-slate-500'

  return (
    <section
      className={`rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 ${className}`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.25em] ${titleColor}`}
      >
        {title}
      </p>

      <div className="mt-5">{children}</div>
    </section>
  )
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function InfoCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black text-white">{value}</p>

      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  )
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function XpDetailCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-2xl">{icon}</p>

      <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-white">+{value}</p>
    </div>
  )
}

function TrophyCard({ trophy }: { trophy: Trophy }) {
  return (
    <div
      className={[
        'rounded-3xl border p-5 transition',
        trophy.unlocked
          ? 'border-emerald-400/20 bg-emerald-400/10'
          : 'border-white/10 bg-slate-950/40 opacity-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <p className="text-3xl">{trophy.icon}</p>

        <div>
          <h3 className="font-black text-white">{trophy.title}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {trophy.description}
          </p>

          <p
            className={[
              'mt-3 text-sm font-black',
              trophy.unlocked ? 'text-emerald-300' : 'text-slate-500',
            ].join(' ')}
          >
            {trophy.unlocked ? 'Trophée obtenu' : 'À débloquer'}
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyText({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">
      {text}
    </div>
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getAutomaticAdvice({
  totalWorkouts,
  progressCount,
  regressCount,
}: {
  totalWorkouts: number
  progressCount: number
  regressCount: number
}) {
  if (totalWorkouts === 0) {
    return 'Ajoute ta première séance pour commencer à générer des conseils personnalisés.'
  }

  if (regressCount > progressCount) {
    return 'Tu as plus de séances en régression qu’en progression. Prévois une séance plus légère ou un jour de repos pour mieux récupérer.'
  }

  if (totalWorkouts < 3) {
    return 'Ajoute encore quelques séances pour obtenir une analyse plus précise de ta progression.'
  }

  return 'Ta progression est positive. Continue à garder une bonne régularité et note ce que tu peux améliorer après chaque séance.'
}