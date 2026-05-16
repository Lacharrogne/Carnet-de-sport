import DailyMissions from '../components/DailyMissions'
import NextPlannedWorkoutCard from '../components/NextPlannedWorkoutCard'
import WeeklyGoalCard from '../components/WeeklyGoalCard'
import WorkoutCard from '../components/WorkoutCard'
import { getDailyMissions } from '../services/missionService'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'
import NextChallengeCard from '../components/NextChallengeCard'
import StreakCard from '../components/StreakCard'
import MotivationSummaryCard from '../components/MotivationSummaryCard'
import ActivityCalendar from '../components/ActivityCalendar'

type DashboardPageProps = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
  onWeeklyGoalChange: (weeklyGoal: WeeklyGoal) => void
  onAddWorkoutClick: () => void
}

export default function DashboardPage({
  workouts,
  plannedWorkouts,
  weeklyGoal,
  onWeeklyGoalChange,
  onAddWorkoutClick,
}: DashboardPageProps) {
  const totalWorkouts = workouts.length

  const totalDuration = workouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const latestWorkouts = [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const recordCount = workouts.filter((workout) => workout.trend === 'record').length

  const dailyMissions = getDailyMissions(workouts)
  const completedMissions = dailyMissions.filter((mission) => mission.completed)
  const completedMissionXp = completedMissions.reduce((total, mission) => {
    return total + mission.xpReward
  }, 0)

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              Carnet de sport
            </p>

            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
              Ton corps devient ton personnage.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Ajoute tes entraînements, suis tes progrès et garde la motivation grâce à des objectifs simples, visuels et ludiques.
            </p>
          </div>

          <NextPlannedWorkoutCard plannedWorkouts={plannedWorkouts} />

          <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Missions du jour
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              {completedMissions.length}/{dailyMissions.length}
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {completedMissions.length === dailyMissions.length
                ? 'Toutes les missions sont validées. Journée réussie.'
                : `Encore ${dailyMissions.length - completedMissions.length} mission(s) à valider.`}
            </p>

            <p className="mt-3 text-sm font-bold text-emerald-300">
              +{completedMissionXp} XP bonus aujourd’hui
            </p>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-slate-400">Séances enregistrées</p>
            <p className="mt-3 text-4xl font-black">{totalWorkouts}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-slate-400">Temps d’activité</p>
            <p className="mt-3 text-4xl font-black">{totalDuration} min</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-slate-400">Records récents</p>
            <p className="mt-3 text-4xl font-black">{recordCount} 🔥</p>
          </div>
        </section>


<MotivationSummaryCard
  workouts={workouts}
  plannedWorkouts={plannedWorkouts}
  weeklyGoal={weeklyGoal}
/>

<ActivityCalendar workouts={workouts} />

<StreakCard workouts={workouts} />

<NextPlannedWorkoutCard plannedWorkouts={plannedWorkouts} />

<WeeklyGoalCard
  workouts={workouts}
  weeklyGoal={weeklyGoal}
  onWeeklyGoalChange={onWeeklyGoalChange}
/>

<NextChallengeCard
  workouts={workouts}
  plannedWorkouts={plannedWorkouts}
  weeklyGoal={weeklyGoal}
/>

        <DailyMissions missions={dailyMissions} />

        <section className="mt-10">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Dernières séances
                </p>

                <h2 className="mt-2 text-3xl font-black">
                Ton historique récent
                </h2>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
                <button
                onClick={onAddWorkoutClick}
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                >
                + Ajouter une séance
                </button>

                <p className="max-w-xs text-right text-xs leading-5 text-slate-500">
                Pour voir toutes tes séances, ta progression ou ton corps, utilise la navigation en haut.
                </p>
            </div>
            </div>

          {latestWorkouts.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {latestWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <p className="text-4xl">🌱</p>

              <h3 className="mt-4 text-2xl font-black">
                Aucune séance pour le moment.
              </h3>

              <p className="mt-2 text-slate-400">
                Ajoute ton premier entraînement pour commencer ta progression.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}