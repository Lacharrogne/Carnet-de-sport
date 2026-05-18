import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

export type Mission = {
  id: string
  title: string
  description: string
  icon: string
  completed: boolean
  progress: number
  target: number
  unit: string
  xpReward: number
}

type GetDailyMissionsParams = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal?: WeeklyGoal
}

function getTodayDateKey() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`)
}

function getStartOfWeek(date: Date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day

  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  return start
}

function getEndOfWeek(date: Date) {
  const end = getStartOfWeek(date)

  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return end
}

function isDateInCurrentWeek(date: string) {
  const workoutDate = parseDate(date)
  const today = new Date()

  const startOfWeek = getStartOfWeek(today)
  const endOfWeek = getEndOfWeek(today)

  return workoutDate >= startOfWeek && workoutDate <= endOfWeek
}

export function getDailyMissions({
  workouts,
  plannedWorkouts,
}: GetDailyMissionsParams): Mission[] {
  const todayDateKey = getTodayDateKey()
  const today = parseDate(todayDateKey)

  const todayWorkouts = workouts.filter((workout) => {
    return workout.date === todayDateKey
  })

  const todayDuration = todayWorkouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const todayWorkoutCount = todayWorkouts.length

  const hasImprovementIdeaToday = todayWorkouts.some((workout) => {
    return workout.improvementIdea.trim().length > 0
  })

  const currentWeekWorkouts = workouts.filter((workout) => {
    return isDateInCurrentWeek(workout.date)
  })

  const weeklySportsCount = new Set(
    currentWeekWorkouts.map((workout) => workout.category),
  ).size

  const upcomingPlannedWorkoutsCount = plannedWorkouts.filter(
    (plannedWorkout) => {
      return parseDate(plannedWorkout.date) >= today
    },
  ).length

  return [
    {
      id: 'move-20-minutes',
      icon: '⚡',
      title: 'Bouger 20 minutes',
      description: 'Fais au moins 20 minutes d’activité aujourd’hui.',
      progress: Math.min(todayDuration, 20),
      target: 20,
      unit: 'min',
      xpReward: 80,
      completed: todayDuration >= 20,
    },
    {
      id: 'log-workout',
      icon: '📝',
      title: 'Noter une séance',
      description: 'Ajoute au moins un entraînement dans ton carnet aujourd’hui.',
      progress: Math.min(todayWorkoutCount, 1),
      target: 1,
      unit: 'séance',
      xpReward: 50,
      completed: todayWorkoutCount >= 1,
    },
    {
      id: 'prepare-next-time',
      icon: '🎯',
      title: 'Préparer la prochaine fois',
      description: 'Ajoute une idée d’amélioration à ta séance du jour.',
      progress: hasImprovementIdeaToday ? 1 : 0,
      target: 1,
      unit: 'idée',
      xpReward: 40,
      completed: hasImprovementIdeaToday,
    },
    {
      id: 'vary-sports',
      icon: '🔁',
      title: 'Varier les sports',
      description: 'Pratique au moins deux types de sport cette semaine.',
      progress: Math.min(weeklySportsCount, 2),
      target: 2,
      unit: 'sports',
      xpReward: 100,
      completed: weeklySportsCount >= 2,
    },
    {
      id: 'plan-session',
      icon: '📅',
      title: 'Planifier une séance',
      description: 'Prévois au moins une séance à venir dans ton planning.',
      progress: Math.min(upcomingPlannedWorkoutsCount, 1),
      target: 1,
      unit: 'séance prévue',
      xpReward: 60,
      completed: upcomingPlannedWorkoutsCount >= 1,
    },
  ]
}