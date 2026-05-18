import { Link } from 'react-router-dom'

import ActivityCalendar from '../components/ActivityCalendar'
import DailyMissions from '../components/DailyMissions'
import MotivationSummaryCard from '../components/MotivationSummaryCard'
import NextChallengeCard from '../components/NextChallengeCard'
import NextPlannedWorkoutCard from '../components/NextPlannedWorkoutCard'
import StreakCard from '../components/StreakCard'
import WeeklyGoalCard from '../components/WeeklyGoalCard'
import WorkoutCard from '../components/WorkoutCard'
import { getDailyMissions } from '../services/missionService'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

type DashboardPageProps = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
  onWeeklyGoalChange: (weeklyGoal: WeeklyGoal) => void
  onAddWorkoutClick: () => void
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

export default function DashboardPage({
  workouts,
  plannedWorkouts,
  weeklyGoal,
  onWeeklyGoalChange,
  onAddWorkoutClick,
}: DashboardPageProps) {
  const today = getTodayDate()
  const startOfWeek = getStartOfWeek()
  const endOfWeek = getEndOfWeek()

  const totalWorkouts = workouts.length

  const totalDuration = workouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const recordCount = workouts.filter((workout) => {
    return workout.trend === 'record'
  }).length

  const latestWorkouts = [...workouts]
    .sort((a, b) => {
      return (
        getDateFromString(b.date).getTime() -
        getDateFromString(a.date).getTime()
      )
    })
    .slice(0, 3)

  const upcomingPlannedWorkouts = plannedWorkouts.filter((plannedWorkout) => {
    return getDateFromString(plannedWorkout.date).getTime() >= today.getTime()
  })

  const weeklyWorkouts = workouts.filter((workout) => {
    const workoutDate = getDateFromString(workout.date)

    return workoutDate >= startOfWeek && workoutDate <= endOfWeek
  })

  const weeklyDuration = weeklyWorkouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const weeklyGoalProgress =
    weeklyGoal.targetMinutes > 0
      ? Math.min(
          Math.round((weeklyDuration / weeklyGoal.targetMinutes) * 100),
          100,
        )
      : 0

  const dailyMissions = getDailyMissions({
    workouts,
    plannedWorkouts,
  })

  const completedMissions = dailyMissions.filter((mission) => {
    return mission.completed
  })

  const completedMissionXp = completedMissions.reduce((total, mission) => {
    return total + mission.xpReward
  }, 0)

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-slate-50">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Carnet de sport
              </p>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Ton corps devient ton personnage.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Ajoute tes entraînements, prépare tes prochaines séances et suis
                ta progression sans te prendre la tête.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onAddWorkoutClick}
                  className="rounded-full bg-emerald-400 px-7 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                >
                  + Ajouter une séance
                </button>

                <Link
                  to="/planning"
                  className="rounded-full border border-white/10 bg-white/5 px-7 py-4 text-center text-sm font-black text-slate-100 transition hover:bg-white/10"
                >
                  Voir le planning
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
                <p className="text-sm font-bold text-emerald-300">
                  Séances réalisées
                </p>

                <p className="mt-3 text-4xl font-black text-white sm:text-5xl">
                  {totalWorkouts}
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  entraînements dans ton carnet
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm font-bold text-slate-300">
                  Temps total
                </p>

                <p className="mt-3 text-4xl font-black text-white sm:text-5xl">
                  {totalDuration}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  minutes d’activité
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm font-bold text-slate-300">
                  Objectif semaine
                </p>

                <p className="mt-3 text-4xl font-black text-white sm:text-5xl">
                  {weeklyGoalProgress}%
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {weeklyDuration} / {weeklyGoal.targetMinutes} min
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-orange-400/20 bg-orange-400/10 p-6">
                <p className="text-sm font-bold text-orange-300">
                  Records récents
                </p>

                <p className="mt-3 text-4xl font-black text-white sm:text-5xl">
                  {recordCount}
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  séances marquantes
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <DailyMissions missions={dailyMissions} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <MotivationSummaryCard
            workouts={workouts}
            plannedWorkouts={plannedWorkouts}
            weeklyGoal={weeklyGoal}
          />

          <NextPlannedWorkoutCard plannedWorkouts={plannedWorkouts} />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-6">
            <StreakCard workouts={workouts} />

            <NextChallengeCard
              workouts={workouts}
              plannedWorkouts={plannedWorkouts}
              weeklyGoal={weeklyGoal}
            />
          </div>

          <ActivityCalendar workouts={workouts} />
        </section>

        <section className="mt-8">
          <WeeklyGoalCard
            workouts={workouts}
            weeklyGoal={weeklyGoal}
            onWeeklyGoalChange={onWeeklyGoalChange}
          />
        </section>

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

            <button
              type="button"
              onClick={onAddWorkoutClick}
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
            >
              + Ajouter une séance
            </button>
          </div>

          {latestWorkouts.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {latestWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
              <p className="text-4xl">🌱</p>

              <h3 className="mt-4 text-2xl font-black">
                Aucune séance pour le moment.
              </h3>

              <p className="mt-2 text-slate-400">
                Ajoute ton premier entraînement pour commencer ta progression.
              </p>

              <button
                type="button"
                onClick={onAddWorkoutClick}
                className="mt-6 rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Créer ma première séance
              </button>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold text-slate-400">
              Séances prévues
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              {plannedWorkouts.length}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold text-slate-400">
              À venir
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              {upcomingPlannedWorkouts.length}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold text-slate-400">
              XP du jour
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              +{completedMissionXp}
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}