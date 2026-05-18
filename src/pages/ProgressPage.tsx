import { useMemo } from 'react'

import AdvancedStatsSection from '../components/AdvancedStatsSection'
import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { Workout } from '../types/workout'

type ProgressPageProps = {
  workouts: Workout[]
  onBack: () => void
}

type Badge = {
  icon: string
  title: string
  description: string
  unlocked: boolean
}

export default function ProgressPage({ workouts, onBack }: ProgressPageProps) {
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => {
      return (
        new Date(`${b.date}T00:00:00`).getTime() -
        new Date(`${a.date}T00:00:00`).getTime()
      )
    })
  }, [workouts])

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

  const xp =
    totalDuration * 2 +
    totalWorkouts * 50 +
    recordCount * 100 +
    progressCount * 40

  const level = Math.floor(xp / 300) + 1
  const currentLevelXp = xp % 300
  const xpPercent = Math.min(Math.round((currentLevelXp / 300) * 100), 100)
  const xpToNextLevel = 300 - currentLevelXp

  const lastWorkout = sortedWorkouts[0] ?? null

  const lastSevenDaysWorkouts = useMemo(() => {
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)

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

  const favoriteCategory = categoryStats.find((category) => category.count > 0)

  const badges: Badge[] = [
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
      unlocked: level >= 5,
    },
  ]

  const unlockedBadges = badges.filter((badge) => badge.unlocked).length

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
        >
          ← Retour au dashboard
        </button>

        <header className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Progression
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                Ton niveau sportif augmente.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Chaque séance te donne de l’XP. Plus tu bouges, plus ton
                personnage progresse.
              </p>
            </div>

            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Niveau actuel
              </p>

              <div className="mt-4 flex items-end gap-3">
                <p className="text-7xl font-black">{level}</p>
                <p className="pb-3 text-slate-300">niveau</p>
              </div>

              <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-950">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-300">
                {currentLevelXp} / 300 XP — encore {xpToNextLevel} XP pour le
                niveau suivant.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="XP total" value={xp.toString()} icon="⚡" />
          <StatCard
            label="Séances"
            value={totalWorkouts.toString()}
            icon="🏃"
          />
          <StatCard
            label="Temps actif"
            value={`${totalDuration} min`}
            icon="⏱️"
          />
          <StatCard
            label="Badges"
            value={`${unlockedBadges}/${badges.length}`}
            icon="🏅"
          />
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
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
        </section>

        <AdvancedStatsSection workouts={workouts} />

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Avatar sportif
            </p>

            <div className="mt-6 flex justify-center">
              <div className="relative flex h-72 w-48 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/5 shadow-2xl shadow-emerald-400/10">
                <div className="absolute top-8 h-16 w-16 rounded-full border border-white/20 bg-white/10" />
                <div className="absolute top-24 h-28 w-20 rounded-[2rem] border border-white/20 bg-white/10" />
                <div className="absolute left-8 top-28 h-24 w-8 rotate-12 rounded-full border border-white/20 bg-white/10" />
                <div className="absolute right-8 top-28 h-24 w-8 -rotate-12 rounded-full border border-white/20 bg-white/10" />
                <div className="absolute bottom-8 left-16 h-24 w-8 rounded-full border border-white/20 bg-white/10" />
                <div className="absolute bottom-8 right-16 h-24 w-8 rounded-full border border-white/20 bg-white/10" />

                <div className="absolute -right-10 top-12 rounded-2xl border border-emerald-400/20 bg-slate-950 px-4 py-3">
                  <p className="text-xs text-slate-400">Force</p>
                  <p className="font-black text-emerald-300">
                    Niv. {Math.max(1, progressCount + recordCount + 1)}
                  </p>
                </div>

                <div className="absolute -left-10 bottom-12 rounded-2xl border border-sky-400/20 bg-slate-950 px-4 py-3">
                  <p className="text-xs text-slate-400">Endurance</p>
                  <p className="font-black text-sky-300">
                    Niv. {Math.max(1, Math.floor(totalDuration / 120) + 1)}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm leading-6 text-slate-300">
              Version simple de la future page corps. Plus tard, les zones
              travaillées pourront s’illuminer selon les sports pratiqués.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Analyse rapide
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoCard
                title="Durée moyenne"
                value={`${averageDuration} min`}
                description="Durée moyenne de tes entraînements."
              />

              <InfoCard
                title="Records"
                value={`${recordCount} 🔥`}
                description="Séances marquées comme record."
              />

              <InfoCard
                title="Progressions"
                value={`${progressCount} 📈`}
                description="Séances où tu estimes avoir progressé."
              />

              <InfoCard
                title="Régressions"
                value={`${regressCount} 📉`}
                description="Séances plus difficiles ou moins bonnes."
              />
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <p className="font-black text-white">Conseil automatique</p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {getAutomaticAdvice({
                  totalWorkouts,
                  progressCount,
                  regressCount,
                })}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Répartition par sport
            </p>

            <div className="mt-6 space-y-4">
              {categoryStats.map((category) => {
                const percent =
                  totalWorkouts > 0
                    ? Math.round((category.count / totalWorkouts) * 100)
                    : 0

                return (
                  <div key={category.id}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <p className="font-bold text-white">
                        {category.emoji} {category.label}
                      </p>

                      <p className="text-sm text-slate-400">
                        {category.count} séance
                        {category.count > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-950">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Badges
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {badges.map((badge) => (
                <div
                  key={badge.title}
                  className={[
                    'rounded-3xl border p-5 transition',
                    badge.unlocked
                      ? 'border-emerald-400/20 bg-emerald-400/10'
                      : 'border-white/10 bg-white/[0.03] opacity-50',
                  ].join(' ')}
                >
                  <p className="text-3xl">{badge.icon}</p>

                  <h3 className="mt-3 font-black text-white">
                    {badge.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {badge.description}
                  </p>

                  <p className="mt-3 text-sm font-bold text-emerald-300">
                    {badge.unlocked ? 'Débloqué' : 'Verrouillé'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

type StatCardProps = {
  label: string
  value: string
  icon: string
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-3xl">{icon}</p>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  )
}

type InfoCardProps = {
  title: string
  value: string
  description: string
}

function InfoCard({ title, value, description }: InfoCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
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