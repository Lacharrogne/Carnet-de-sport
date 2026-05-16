import { getAdvancedWorkoutStats } from '../services/workoutStatsService'
import type { Workout } from '../types/workout'

type AdvancedStatsSectionProps = {
  workouts: Workout[]
}

export default function AdvancedStatsSection({
  workouts,
}: AdvancedStatsSectionProps) {
  const stats = getAdvancedWorkoutStats(workouts)

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
            Statistiques avancées
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            Tes performances par sport.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Ces données sont calculées à partir des détails que tu ajoutes dans tes séances.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
          <p className="text-sm text-emerald-300">
            Sport dominant
          </p>

          <p className="mt-1 text-2xl font-black text-white">
            {stats.favoriteSportEmoji} {stats.favoriteSportLabel}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdvancedStatCard
          icon="⏱️"
          label="Durée moyenne"
          value={`${stats.averageDuration} min`}
          description="Temps moyen par séance."
        />

        <AdvancedStatCard
          icon="🛣️"
          label="Distance terrestre"
          value={`${formatNumber(stats.totalDistanceKm)} km`}
          description="Course, marche et vélo."
        />

        <AdvancedStatCard
          icon="🏊"
          label="Distance natation"
          value={`${formatNumber(stats.swimmingDistanceM)} m`}
          description="Total nagé enregistré."
        />

        <AdvancedStatCard
          icon="🏔️"
          label="Dénivelé vélo"
          value={`${formatNumber(stats.totalElevation)} m`}
          description="Dénivelé positif total."
        />

        <AdvancedStatCard
          icon="🏋️"
          label="Séries musculation"
          value={stats.totalSets.toString()}
          description="Nombre total de séries."
        />

        <AdvancedStatCard
          icon="💪"
          label="Charge max"
          value={`${stats.maxWeight} kg`}
          description="Charge principale la plus élevée."
        />

        <AdvancedStatCard
          icon="⚽"
          label="Buts football"
          value={stats.footballGoals.toString()}
          description="Buts enregistrés."
        />

        <AdvancedStatCard
          icon="🎯"
          label="Passes décisives"
          value={stats.footballAssists.toString()}
          description="Passes enregistrées."
        />
      </div>

      <div className="mt-6 rounded-3xl border border-sky-400/10 bg-sky-400/5 p-5">
        <p className="font-black text-white">
          Analyse rapide
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          {getAdvancedSuggestion(stats)}
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

      <p className="mt-4 text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-white">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </article>
  )
}

function formatNumber(value: number) {
  if (Number.isInteger(value)) {
    return value.toString()
  }

  return value.toFixed(1)
}

function getAdvancedSuggestion(
  stats: ReturnType<typeof getAdvancedWorkoutStats>
) {
  if (stats.totalWorkouts === 0) {
    return 'Ajoute une première séance pour commencer à générer des statistiques.'
  }

  if (stats.activeSportsCount <= 1) {
    return 'Tu pratiques surtout un seul type de sport. Ajouter une deuxième activité pourrait rendre ta progression plus complète.'
  }

  if (stats.totalDistanceKm === 0 && stats.swimmingDistanceM === 0) {
    return 'Tu n’as pas encore beaucoup de données de distance. Pour les sports cardio, pense à renseigner les kilomètres ou les mètres.'
  }

  if (stats.totalSets === 0 && stats.maxWeight === 0) {
    return 'Tes séances de musculation peuvent devenir plus précises si tu ajoutes les séries, les répétitions et les charges.'
  }

  return 'Tes données commencent à devenir intéressantes. Continue à détailler tes séances pour obtenir des statistiques de plus en plus utiles.'
}