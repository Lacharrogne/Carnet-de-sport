import type { Workout } from '../types/workout'

export type Mission = {
  id: string
  icon: string
  title: string
  description: string
  xpReward: number
  completed: boolean
  progressLabel: string
}

function getTodayKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getWorkoutDate(date: string) {
  return new Date(`${date}T00:00:00`)
}

function isInLastDays(date: string, days: number) {
  const today = new Date()
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const workoutDate = getWorkoutDate(date)
  const difference = todayStart.getTime() - workoutDate.getTime()
  const maxDifference = (days - 1) * 24 * 60 * 60 * 1000

  return difference >= 0 && difference <= maxDifference
}

export function getDailyMissions(workouts: Workout[]): Mission[] {
  const todayKey = getTodayKey()

  const todayWorkouts = workouts.filter((workout) => {
    return workout.date === todayKey
  })

  const todayDuration = todayWorkouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const workoutsThisWeek = workouts.filter((workout) => {
    return isInLastDays(workout.date, 7)
  })

  const sportsThisWeek = new Set(
    workoutsThisWeek.map((workout) => workout.category)
  )

  const hasImprovementIdeaToday = todayWorkouts.some((workout) => {
    return workout.improvementIdea.trim().length > 0
  })

  return [
    {
      id: 'move-20-minutes',
      icon: '⚡',
      title: 'Bouger 20 minutes',
      description: 'Fais au moins 20 minutes d’activité aujourd’hui.',
      xpReward: 80,
      completed: todayDuration >= 20,
      progressLabel: `${Math.min(todayDuration, 20)} / 20 min`,
    },
    {
      id: 'add-workout',
      icon: '📝',
      title: 'Noter une séance',
      description: 'Ajoute au moins un entraînement dans ton carnet aujourd’hui.',
      xpReward: 50,
      completed: todayWorkouts.length >= 1,
      progressLabel: `${Math.min(todayWorkouts.length, 1)} / 1 séance`,
    },
    {
      id: 'prepare-next-time',
      icon: '🎯',
      title: 'Préparer la prochaine fois',
      description: 'Ajoute une idée d’amélioration à ta séance du jour.',
      xpReward: 40,
      completed: hasImprovementIdeaToday,
      progressLabel: hasImprovementIdeaToday ? 'Objectif noté' : 'À compléter',
    },
    {
      id: 'sport-variety',
      icon: '🔁',
      title: 'Varier les sports',
      description: 'Pratique au moins deux types de sport cette semaine.',
      xpReward: 100,
      completed: sportsThisWeek.size >= 2,
      progressLabel: `${Math.min(sportsThisWeek.size, 2)} / 2 sports`,
    },
  ]
}