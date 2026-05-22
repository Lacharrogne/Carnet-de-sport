import { useMemo, type ReactNode } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import { getSportProfileXp } from '../services/xpService'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { StrengthExercise, Workout } from '../types/workout'

type ProgressPageProps = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
  onBack: () => void
}

type Badge = {
  icon: string
  title: string
  description: string
  unlocked: boolean
}

type CategoryStat = (typeof SPORT_CATEGORIES)[number] & {
  count: number
  duration: number
  distance: number
  elevation: number
  strengthVolume: number
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
        getDateFromString(b.date).getTime() -
        getDateFromString(a.date).getTime()
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

  const totalDistanceKm = useMemo(() => {
    return workouts.reduce((total, workout) => {
      if (workout.category === 'natation') {
        return total
      }

      return total + (workout.details?.distance ?? 0)
    }, 0)
  }, [workouts])

  const totalSwimmingDistance = useMemo(() => {
    return workouts.reduce((total, workout) => {
      if (workout.category !== 'natation') {
        return total
      }

      return total + (workout.details?.distance ?? 0)
    }, 0)
  }, [workouts])

  const totalElevation = useMemo(() => {
    return workouts.reduce((total, workout) => {
      return total + (workout.details?.elevation ?? 0)
    }, 0)
  }, [workouts])

  const totalStrengthVolume = useMemo(() => {
    return workouts.reduce((total, workout) => {
      const exercises = workout.details?.strengthExercises ?? []

      return total + getTotalStrengthVolume(exercises)
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

  const weeklyWorkouts = useMemo(() => {
    const startOfWeek = getStartOfWeek()
    const endOfWeek = getEndOfWeek()

    return workouts.filter((workout) => {
      const workoutDate = getDateFromString(workout.date)

      return workoutDate >= startOfWeek && workoutDate <= endOfWeek
    })
  }, [workouts])

  const weeklyDuration = useMemo(() => {
    return weeklyWorkouts.reduce((total, workout) => {
      return total + workout.duration
    }, 0)
  }, [weeklyWorkouts])

  const weeklyGoalProgress =
    weeklyGoal.targetMinutes > 0
      ? Math.min(
          Math.round((weeklyDuration / weeklyGoal.targetMinutes) * 100),
          100,
        )
      : 0

  const averageDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

  const lastWorkout = sortedWorkouts[0] ?? null

  const categoryStats = useMemo<CategoryStat[]>(() => {
    return SPORT_CATEGORIES.map((category) => {
      const categoryWorkouts = workouts.filter((workout) => {
        return workout.category === category.id
      })

      const categoryDuration = categoryWorkouts.reduce((total, workout) => {
        return total + workout.duration
      }, 0)

      const categoryDistance = categoryWorkouts.reduce((total, workout) => {
        return total + (workout.details?.distance ?? 0)
      }, 0)

      const categoryElevation = categoryWorkouts.reduce((total, workout) => {
        return total + (workout.details?.elevation ?? 0)
      }, 0)

      const categoryStrengthVolume = categoryWorkouts.reduce(
        (total, workout) => {
          const exercises = workout.details?.strengthExercises ?? []

          return total + getTotalStrengthVolume(exercises)
        },
        0,
      )

      return {
        ...category,
        count: categoryWorkouts.length,
        duration: categoryDuration,
        distance: categoryDistance,
        elevation: categoryElevation,
        strengthVolume: categoryStrengthVolume,
      }
    }).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }

      return b.duration - a.duration
    })
  }, [workouts])

  const visibleCategoryStats = categoryStats.filter((category) => {
    return category.count > 0
  })

  const favoriteCategory = visibleCategoryStats[0] ?? null
  const sportsTriedCount = visibleCategoryStats.length

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
      icon: '🧭',
      title: 'Explorateur',
      description: 'Pratiquer au moins trois sports différents.',
      unlocked: sportsTriedCount >= 3,
    },
    {
      icon: '⛰️',
      title: 'Ça grimpe',
      description: 'Cumuler au moins 500 m de dénivelé.',
      unlocked: totalElevation >= 500,
    },
    {
      icon: '👑',
      title: 'Machine lancée',
      description: 'Atteindre le niveau 5.',
      unlocked: sportProfileXp.level >= 5,
    },
  ]

  const unlockedBadges = badges.filter((badge) => badge.unlocked).length

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-slate-50">
      <section className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-200 transition hover:bg-white/10"
        >
          ← Retour au dashboard
        </button>

        <header className="relative overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 via-white/[0.04] to-sky-400/10 p-5 shadow-2xl shadow-black/25 sm:p-7 lg:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                Progression globale
              </p>

              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Niveau {sportProfileXp.level}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Suis ton XP, tes séances, tes sports les plus pratiqués, tes
                distances, ton volume d’entraînement et les badges débloqués.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <HeroStat label="XP total" value={sportProfileXp.totalXp} />

                <HeroStat label="Séances" value={totalWorkouts} />

                <HeroStat
                  label="Temps actif"
                  value={formatDuration(totalDuration)}
                />

                <HeroStat
                  label="Distance"
                  value={formatGlobalDistance(
                    totalDistanceKm,
                    totalSwimmingDistance,
                  )}
                />

                <HeroStat
                  label="Badges"
                  value={`${unlockedBadges}/${badges.length}`}
                />
              </div>
            </div>

            <LevelCard sportProfileXp={sportProfileXp} />
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <Panel title="Détail de l’XP" accent="emerald">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                  label="Défis"
                  value={sportProfileXp.details.challengeXp}
                  icon="🎯"
                />

                <XpDetailCard
                  label="Missions"
                  value={sportProfileXp.details.missionXp}
                  icon="✅"
                />
              </div>
            </Panel>
<Panel title="Stats clés">
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <CompactStat
      label="Distance totale"
      value={formatGlobalDistance(totalDistanceKm, totalSwimmingDistance)}
    />

    <CompactStat
      label="Dénivelé"
      value={totalElevation > 0 ? `${formatNumber(totalElevation)} m` : '—'}
    />

    <CompactStat
      label="Volume muscu"
      value={
        totalStrengthVolume > 0
          ? `${formatNumber(totalStrengthVolume)} kg`
          : '—'
      }
    />

    <CompactStat
      label="Sports testés"
      value={`${sportsTriedCount}`}
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
                      <CategoryProgressCard
                        key={category.id}
                        category={category}
                        percent={percent}
                      />
                    )
                  })}
                </div>
              ) : (
                <EmptyText text="Aucune séance enregistrée pour le moment." />
              )}
            </Panel>

            <Panel title="Badges" accent="emerald">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {badges.map((badge) => (
                  <BadgeCard key={badge.title} badge={badge} />
                ))}
              </div>
            </Panel>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <Panel title="Résumé rapide" accent="emerald">
              <div className="space-y-3">
                <InfoCard
                  title="Cette semaine"
                  value={formatDuration(weeklyDuration)}
                  description={`${weeklyWorkouts.length} séance${
                    weeklyWorkouts.length > 1 ? 's' : ''
                  } enregistrée${weeklyWorkouts.length > 1 ? 's' : ''}.`}
                />

                <InfoCard
                  title="Objectif semaine"
                  value={
                    weeklyGoal.targetMinutes > 0
                      ? `${weeklyGoalProgress}%`
                      : 'Non défini'
                  }
                  description={
                    weeklyGoal.targetMinutes > 0
                      ? `${formatDuration(weeklyDuration)} sur ${formatDuration(
                          weeklyGoal.targetMinutes,
                        )}.`
                      : 'Définis un objectif pour suivre ta régularité.'
                  }
                />

                <InfoCard
                  title="Dernière séance"
                  value={lastWorkout ? lastWorkout.title : 'Aucune'}
                  description={
                    lastWorkout
                      ? `${formatDate(lastWorkout.date)} · ${formatDuration(
                          lastWorkout.duration,
                        )}`
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
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <CompactStat
                  label="Durée moyenne"
                  value={formatDuration(averageDuration)}
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

                <CompactStat
                  label="Dénivelé total"
                  value={
                    totalElevation > 0
                      ? `${formatNumber(totalElevation)} m`
                      : '—'
                  }
                />

                <CompactStat
                  label="Volume muscu"
                  value={
                    totalStrengthVolume > 0
                      ? `${formatNumber(totalStrengthVolume)} kg`
                      : '—'
                  }
                />
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="font-black text-white">Conseil automatique</p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {getAutomaticAdvice({
                    totalWorkouts,
                    progressCount,
                    regressCount,
                    plannedWorkoutsCount: plannedWorkouts.length,
                    weeklyGoalProgress,
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
          className="h-full rounded-full bg-emerald-400"
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

function Panel({
  title,
  children,
  accent = 'default',
}: {
  title: string
  children: ReactNode
  accent?: 'default' | 'emerald'
}) {
  const titleColor =
    accent === 'emerald' ? 'text-emerald-300' : 'text-slate-500'

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
      <p
        className={`text-xs font-black uppercase tracking-[0.24em] ${titleColor}`}
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

      <p className="mt-2 break-words text-2xl font-black text-white">
        {value}
      </p>
    </div>
  )
}

function CategoryProgressCard({
  category,
  percent,
}: {
  category: CategoryStat
  percent: number
}) {
  const metaItems = getCategoryMetaItems(category)

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-black text-white">
          {category.emoji} {category.label}
        </p>

        <p className="text-sm font-black text-emerald-300">{percent}%</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-950">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {metaItems.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-slate-300"
          >
            {item}
          </span>
        ))}
      </div>
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

      <p className="mt-2 line-clamp-2 text-xl font-black text-white">{value}</p>

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
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-2xl">{icon}</p>

        <p className="text-xl font-black text-white">+{value}</p>
      </div>

      <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
    </div>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className={[
        'rounded-3xl border p-5 transition',
        badge.unlocked
          ? 'border-emerald-400/20 bg-emerald-400/10'
          : 'border-white/10 bg-slate-950/40 opacity-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <p className="text-3xl">{badge.icon}</p>

        <div>
          <h3 className="font-black text-white">{badge.title}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {badge.description}
          </p>

          <p
            className={[
              'mt-3 text-sm font-black',
              badge.unlocked ? 'text-emerald-300' : 'text-slate-500',
            ].join(' ')}
          >
            {badge.unlocked ? 'Badge obtenu' : 'À débloquer'}
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

function getCategoryMetaItems(category: CategoryStat) {
  const items = [
    `${category.count} séance${category.count > 1 ? 's' : ''}`,
    formatDuration(category.duration),
  ]

  if (category.distance > 0) {
    items.push(formatDistanceForCategory(category.id, category.distance))
  }

  if (category.elevation > 0) {
    items.push(`${formatNumber(category.elevation)} m D+`)
  }

  if (category.strengthVolume > 0) {
    items.push(`${formatNumber(category.strengthVolume)} kg`)
  }

  return items
}

function getTotalStrengthVolume(exercises: StrengthExercise[]) {
  return exercises.reduce((total, exercise) => {
    return total + getExerciseVolume(exercise)
  }, 0)
}

function getExerciseVolume(exercise: StrengthExercise) {
  const sets = parseSportNumber(exercise.sets)
  const reps = parseSportNumber(exercise.reps)
  const weight = parseSportNumber(exercise.weight)

  if (!sets || !reps || !weight) {
    return 0
  }

  return sets * reps * weight
}

function parseSportNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0
  }

  const normalizedValue = String(value).trim().replace(',', '.')
  const match = normalizedValue.match(/\d+(\.\d+)?/)

  if (!match) {
    return 0
  }

  return Number(match[0])
}

function formatGlobalDistance(distanceKm: number, swimmingMeters: number) {
  if (distanceKm <= 0 && swimmingMeters <= 0) {
    return '—'
  }

  if (distanceKm > 0 && swimmingMeters > 0) {
    return `${formatNumber(distanceKm, 1)} km + ${formatNumber(
      swimmingMeters,
    )} m`
  }

  if (distanceKm > 0) {
    return `${formatNumber(distanceKm, 1)} km`
  }

  return `${formatNumber(swimmingMeters)} m`
}

function formatDistanceForCategory(categoryId: string, distance: number) {
  if (categoryId === 'natation') {
    return `${formatNumber(distance)} m`
  }

  return `${formatNumber(distance, 1)} km`
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes} min`
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits,
  }).format(value)
}

function getAutomaticAdvice({
  totalWorkouts,
  progressCount,
  regressCount,
  plannedWorkoutsCount,
  weeklyGoalProgress,
}: {
  totalWorkouts: number
  progressCount: number
  regressCount: number
  plannedWorkoutsCount: number
  weeklyGoalProgress: number
}) {
  if (totalWorkouts === 0) {
    return 'Ajoute ta première séance pour commencer à générer des conseils personnalisés.'
  }

  if (plannedWorkoutsCount === 0) {
    return 'Tu as déjà des séances enregistrées. Planifie maintenant tes prochaines séances pour garder une vraie régularité.'
  }

  if (weeklyGoalProgress >= 100) {
    return 'Objectif hebdomadaire atteint. Tu peux maintenir le rythme ou prévoir une séance plus légère pour bien récupérer.'
  }

  if (regressCount > progressCount) {
    return 'Tu as plus de séances en régression qu’en progression. Prévois une séance plus légère ou un jour de repos pour mieux récupérer.'
  }

  if (totalWorkouts < 3) {
    return 'Ajoute encore quelques séances pour obtenir une analyse plus précise de ta progression.'
  }

  return 'Ta progression est positive. Continue à garder une bonne régularité et note ce que tu peux améliorer après chaque séance.'
}

function getTodayDate() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return today
}

function getStartOfWeek() {
  const today = getTodayDate()
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day

  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() + diff)
  startOfWeek.setHours(0, 0, 0, 0)

  return startOfWeek
}

function getEndOfWeek() {
  const startOfWeek = getStartOfWeek()
  const endOfWeek = new Date(startOfWeek)

  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return endOfWeek
}

function getDateFromString(date: string) {
  return new Date(`${date}T00:00:00`)
}