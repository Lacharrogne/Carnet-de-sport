import { SPORT_CATEGORIES } from '../data/sportOptions'
import { getAdvancedWorkoutStats } from '../services/workoutStatsService'
import type { Workout } from '../types/workout'

type AdvancedStatsSectionProps = {
  workouts: Workout[]
}

export default function AdvancedStatsSection({
  workouts,
}: AdvancedStatsSectionProps) {
  const advancedStats = getAdvancedWorkoutStats(workouts)

  const sortedWorkouts = [...workouts].sort((a, b) => {
    return (
      new Date(`${b.date}T00:00:00`).getTime() -
      new Date(`${a.date}T00:00:00`).getTime()
    )
  })

  const activeDaysCount = new Set(workouts.map((workout) => workout.date)).size

  const currentStreak = getCurrentStreak(workouts)
  const bestWeek = getBestWeek(workouts)
  const averageWeeklyDuration = getAverageWeeklyDuration(workouts)
  const mostRegularSport = getMostRegularSport(workouts)

  const latestProgressWorkout = sortedWorkouts.find((workout) => {
    return workout.trend === 'progress' || workout.trend === 'record'
  })

  const latestRegressWorkout = sortedWorkouts.find((workout) => {
    return workout.trend === 'regress'
  })

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
            Statistiques avancées
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            Tes habitudes sportives.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Cette section analyse ta régularité, tes meilleures périodes et les
            détails que tu ajoutes dans tes séances.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
          <p className="text-sm text-emerald-300">Sport dominant</p>

          <p className="mt-1 text-2xl font-black text-white">
            {advancedStats.favoriteSportEmoji} {advancedStats.favoriteSportLabel}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdvancedStatCard
          icon="📅"
          label="Jours actifs"
          value={activeDaysCount.toString()}
          description="Nombre de jours différents avec une séance."
        />

        <AdvancedStatCard
          icon="🔥"
          label="Série actuelle"
          value={`${currentStreak} jour${currentStreak > 1 ? 's' : ''}`}
          description="Jours actifs consécutifs récents."
        />

        <AdvancedStatCard
          icon="🏆"
          label="Meilleure semaine"
          value={`${bestWeek.minutes} min`}
          description={
            bestWeek.weekLabel
              ? `${bestWeek.sessions} séance${
                  bestWeek.sessions > 1 ? 's' : ''
                } · ${bestWeek.weekLabel}`
              : 'Aucune semaine active.'
          }
        />

        <AdvancedStatCard
          icon="📊"
          label="Moyenne / semaine"
          value={`${averageWeeklyDuration} min`}
          description="Temps moyen sur les semaines actives."
        />

        <AdvancedStatCard
          icon="⏱️"
          label="Durée moyenne"
          value={`${advancedStats.averageDuration} min`}
          description="Temps moyen par séance."
        />

        <AdvancedStatCard
          icon="🛣️"
          label="Distance terrestre"
          value={`${formatNumber(advancedStats.totalDistanceKm)} km`}
          description="Course, marche et vélo."
        />

        <AdvancedStatCard
          icon="🏊"
          label="Distance natation"
          value={`${formatNumber(advancedStats.swimmingDistanceM)} m`}
          description="Total nagé enregistré."
        />

        <AdvancedStatCard
          icon="🏔️"
          label="Dénivelé vélo"
          value={`${formatNumber(advancedStats.totalElevation)} m`}
          description="Dénivelé positif total."
        />

        <AdvancedStatCard
          icon="🏋️"
          label="Séries musculation"
          value={advancedStats.totalSets.toString()}
          description="Nombre total de séries."
        />

        <AdvancedStatCard
          icon="💪"
          label="Charge max"
          value={`${advancedStats.maxWeight} kg`}
          description="Charge principale la plus élevée."
        />

        <AdvancedStatCard
          icon="⚽"
          label="Buts football"
          value={advancedStats.footballGoals.toString()}
          description="Buts enregistrés."
        />

        <AdvancedStatCard
          icon="🎯"
          label="Passes décisives"
          value={advancedStats.footballAssists.toString()}
          description="Passes enregistrées."
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <InsightCard
          title="Sport le plus régulier"
          value={
            mostRegularSport
              ? `${mostRegularSport.emoji} ${mostRegularSport.label}`
              : 'Aucun'
          }
          description={
            mostRegularSport
              ? `${mostRegularSport.activeDays} jour${
                  mostRegularSport.activeDays > 1 ? 's' : ''
                } actif${mostRegularSport.activeDays > 1 ? 's' : ''} sur ce sport.`
              : 'Ajoute plusieurs séances pour voir ton sport le plus régulier.'
          }
        />

        <InsightCard
          title="Dernière progression"
          value={
            latestProgressWorkout
              ? latestProgressWorkout.title
              : 'Aucune progression'
          }
          description={
            latestProgressWorkout
              ? `${formatDate(latestProgressWorkout.date)} · ${latestProgressWorkout.duration} min`
              : 'Marque une séance comme progression ou record pour remplir cette carte.'
          }
        />

        <InsightCard
          title="Dernière régression"
          value={
            latestRegressWorkout
              ? latestRegressWorkout.title
              : 'Aucune régression'
          }
          description={
            latestRegressWorkout
              ? `${formatDate(latestRegressWorkout.date)} · pense à regarder tes notes.`
              : 'Très bien : aucune séance récente marquée en régression.'
          }
        />
      </div>

      <div className="mt-6 rounded-3xl border border-sky-400/10 bg-sky-400/5 p-5">
        <p className="font-black text-white">Analyse automatique</p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          {getAdvancedSuggestion({
            workouts,
            advancedStats,
            currentStreak,
            activeDaysCount,
            latestRegressWorkout,
          })}
        </p>
      </div>
    </section>
  )
}

type AdvancedStatCardProps = {
  icon: string
  label: string
  value: string
  description: string
}

function AdvancedStatCard({
  icon,
  label,
  value,
  description,
}: AdvancedStatCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-3xl">{icon}</p>

      <p className="mt-4 text-sm text-slate-400">{label}</p>

      <p className="mt-2 text-3xl font-black text-white">{value}</p>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  )
}

type InsightCardProps = {
  title: string
  value: string
  description: string
}

function InsightCard({ title, value, description }: InsightCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-sm font-semibold text-slate-400">{title}</p>

      <p className="mt-3 text-xl font-black text-white">{value}</p>

      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  )
}

function getAverageWeeklyDuration(workouts: Workout[]) {
  if (workouts.length === 0) {
    return 0
  }

  const weeks = getWorkoutWeeks(workouts)
  const totalDuration = workouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  return weeks.length > 0 ? Math.round(totalDuration / weeks.length) : 0
}

function formatNumber(value: number) {
  if (Number.isInteger(value)) {
    return value.toString()
  }

  return value.toFixed(1)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getCurrentStreak(workouts: Workout[]) {
  if (workouts.length === 0) {
    return 0
  }

  const activeDays = new Set(workouts.map((workout) => workout.date))

  const sortedDates = [...activeDays].sort((a, b) => {
    return (
      new Date(`${b}T00:00:00`).getTime() -
      new Date(`${a}T00:00:00`).getTime()
    )
  })

  const mostRecentDate = new Date(`${sortedDates[0]}T00:00:00`)
  let streak = 0
  const cursor = new Date(mostRecentDate)

  while (activeDays.has(getDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function getWorkoutWeeks(workouts: Workout[]) {
  const weeks = new Set<string>()

  workouts.forEach((workout) => {
    weeks.add(getWeekKey(workout.date))
  })

  return [...weeks]
}

function getBestWeek(workouts: Workout[]) {
  const weeks = workouts.reduce<
    Record<string, { weekLabel: string; minutes: number; sessions: number }>
  >((acc, workout) => {
    const weekKey = getWeekKey(workout.date)

    const currentWeek = acc[weekKey] ?? {
      weekLabel: weekKey,
      minutes: 0,
      sessions: 0,
    }

    acc[weekKey] = {
      ...currentWeek,
      minutes: currentWeek.minutes + workout.duration,
      sessions: currentWeek.sessions + 1,
    }

    return acc
  }, {})

  const bestWeek = Object.values(weeks).sort((a, b) => {
    return b.minutes - a.minutes
  })[0]

  return (
    bestWeek ?? {
      weekLabel: '',
      minutes: 0,
      sessions: 0,
    }
  )
}

function getWeekKey(date: string) {
  const currentDate = new Date(`${date}T00:00:00`)
  const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1)

  const pastDaysOfYear =
    (currentDate.getTime() - firstDayOfYear.getTime()) / 86400000

  const weekNumber = Math.ceil(
    (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7,
  )

  return `Semaine ${weekNumber} · ${currentDate.getFullYear()}`
}

function getMostRegularSport(workouts: Workout[]) {
  const stats = SPORT_CATEGORIES.map((category) => {
    const activeDays = new Set(
      workouts
        .filter((workout) => workout.category === category.id)
        .map((workout) => workout.date),
    )

    return {
      emoji: category.emoji,
      label: category.label,
      activeDays: activeDays.size,
    }
  }).sort((a, b) => b.activeDays - a.activeDays)

  return stats.find((stat) => stat.activeDays > 0) ?? null
}

function getAdvancedSuggestion({
  workouts,
  advancedStats,
  currentStreak,
  activeDaysCount,
  latestRegressWorkout,
}: {
  workouts: Workout[]
  advancedStats: ReturnType<typeof getAdvancedWorkoutStats>
  currentStreak: number
  activeDaysCount: number
  latestRegressWorkout?: Workout
}) {
  if (workouts.length === 0) {
    return 'Ajoute une première séance pour commencer à générer des statistiques utiles.'
  }

  if (currentStreak >= 3) {
    return `Tu es sur une bonne série avec ${currentStreak} jours actifs consécutifs. Continue, mais garde au moins une séance plus légère si la fatigue monte.`
  }

  if (latestRegressWorkout) {
    return `Ta dernière régression vient de "${latestRegressWorkout.title}". Regarde tes notes : sommeil, fatigue, charge ou intensité peuvent expliquer la baisse.`
  }

  if (advancedStats.activeSportsCount <= 1 && workouts.length >= 3) {
    return 'Tu pratiques surtout un seul type de sport. Ajouter une deuxième activité peut améliorer ton équilibre général.'
  }

  if (activeDaysCount < 3 && workouts.length >= 3) {
    return 'Tu as plusieurs séances, mais peu de jours actifs différents. Essaie de mieux répartir tes entraînements dans la semaine.'
  }

  if (
    advancedStats.totalDistanceKm === 0 &&
    advancedStats.swimmingDistanceM === 0
  ) {
    return 'Pour les sports cardio, pense à renseigner les distances. Tes statistiques deviendront beaucoup plus intéressantes.'
  }

  if (advancedStats.totalSets === 0 && advancedStats.maxWeight === 0) {
    return 'Pour la musculation, renseigne les séries, répétitions et charges afin de mieux suivre ta progression.'
  }

  return 'Tes données deviennent solides. Continue à détailler tes séances : plus tu notes précisément, plus les conseils seront utiles.'
}