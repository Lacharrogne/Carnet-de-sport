import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'
import { getStreakStats } from './streakService'

export type Challenge = {
  id: string
  icon: string
  title: string
  description: string
  progress: number
  target: number
  unit: string
  xp: number
  unlocked: boolean
}

export function getChallenges({
  workouts,
  plannedWorkouts,
  weeklyGoal,
}: {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
}): Challenge[] {
  const weeklyWorkouts = getCurrentWeekWorkouts(workouts)
  const weeklyMinutes = weeklyWorkouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const weeklySports = new Set(
    weeklyWorkouts.map((workout) => workout.category)
  )

  const hasRecord = workouts.some((workout) => workout.trend === 'record')
  const hasProgress = workouts.some((workout) => workout.trend === 'progress')
  const hasCardio = workouts.some((workout) => {
    return (
      workout.category === 'course' ||
      workout.category === 'marche' ||
      workout.category === 'velo' ||
      workout.category === 'natation'
    )
  })

  const totalMinutes = workouts.reduce((total, workout) => {
  return total + workout.duration
}, 0)

const strengthWorkouts = workouts.filter((workout) => {
  return workout.category === 'musculation'
})

const cardioWorkouts = workouts.filter((workout) => {
  return (
    workout.category === 'course' ||
    workout.category === 'marche' ||
    workout.category === 'velo' ||
    workout.category === 'natation'
  )
})

const streakStats = getStreakStats(workouts)

  return [
    {
      id: 'first-workout',
      icon: '🌱',
      title: 'Premier pas',
      description: 'Ajoute ta première séance.',
      progress: Math.min(workouts.length, 1),
      target: 1,
      unit: 'séance',
      xp: 50,
      unlocked: workouts.length >= 1,
    },
    {
      id: 'weekly-three',
      icon: '🏋️',
      title: 'Semaine active',
      description: 'Fais 3 séances cette semaine.',
      progress: Math.min(weeklyWorkouts.length, 3),
      target: 3,
      unit: 'séances',
      xp: 150,
      unlocked: weeklyWorkouts.length >= 3,
    },
    {
      id: 'weekly-goal',
      icon: '⚡',
      title: 'Objectif hebdo',
      description: 'Atteins ton objectif hebdomadaire.',
      progress: Math.min(weeklyMinutes, weeklyGoal.targetMinutes),
      target: weeklyGoal.targetMinutes,
      unit: 'min',
      xp: 200,
      unlocked: weeklyMinutes >= weeklyGoal.targetMinutes,
    },
    {
      id: 'two-sports',
      icon: '🔁',
      title: 'Variation',
      description: 'Pratique au moins 2 sports différents cette semaine.',
      progress: Math.min(weeklySports.size, 2),
      target: 2,
      unit: 'sports',
      xp: 100,
      unlocked: weeklySports.size >= 2,
    },
    {
      id: 'record',
      icon: '🔥',
      title: 'Mode record',
      description: 'Enregistre une séance marquée comme record.',
      progress: hasRecord ? 1 : 0,
      target: 1,
      unit: 'record',
      xp: 120,
      unlocked: hasRecord,
    },
    {
      id: 'progress',
      icon: '📈',
      title: 'En progression',
      description: 'Ajoute une séance où tu sens une progression.',
      progress: hasProgress ? 1 : 0,
      target: 1,
      unit: 'progression',
      xp: 80,
      unlocked: hasProgress,
    },
    {
      id: 'cardio',
      icon: '🫀',
      title: 'Cardio lancé',
      description: 'Ajoute une séance de course, marche, vélo ou natation.',
      progress: hasCardio ? 1 : 0,
      target: 1,
      unit: 'séance',
      xp: 80,
      unlocked: hasCardio,
    },
    {
      id: 'planning',
      icon: '📅',
      title: 'Préparation',
      description: 'Planifie au moins une séance à venir.',
      progress: Math.min(plannedWorkouts.length, 1),
      target: 1,
      unit: 'séance prévue',
      xp: 60,
      unlocked: plannedWorkouts.length >= 1,
    },
    {
  id: 'five-workouts',
  icon: '🏅',
  title: 'Régulier',
  description: 'Enregistre 5 séances au total.',
  progress: Math.min(workouts.length, 5),
  target: 5,
  unit: 'séances',
  xp: 200,
  unlocked: workouts.length >= 5,
},
{
  id: 'ten-workouts',
  icon: '👑',
  title: 'Machine lancée',
  description: 'Enregistre 10 séances au total.',
  progress: Math.min(workouts.length, 10),
  target: 10,
  unit: 'séances',
  xp: 400,
  unlocked: workouts.length >= 10,
},
{
  id: 'five-hundred-minutes',
  icon: '⏱️',
  title: 'Endurance',
  description: 'Atteins 500 minutes de sport enregistrées.',
  progress: Math.min(totalMinutes, 500),
  target: 500,
  unit: 'min',
  xp: 300,
  unlocked: totalMinutes >= 500,
},
{
  id: 'thousand-minutes',
  icon: '🚀',
  title: 'Monstre de régularité',
  description: 'Atteins 1000 minutes de sport enregistrées.',
  progress: Math.min(totalMinutes, 1000),
  target: 1000,
  unit: 'min',
  xp: 600,
  unlocked: totalMinutes >= 1000,
},
{
  id: 'five-strength',
  icon: '💪',
  title: 'Force construite',
  description: 'Ajoute 5 séances de musculation.',
  progress: Math.min(strengthWorkouts.length, 5),
  target: 5,
  unit: 'séances',
  xp: 250,
  unlocked: strengthWorkouts.length >= 5,
},
{
  id: 'five-cardio',
  icon: '🫀',
  title: 'Cœur solide',
  description: 'Ajoute 5 séances cardio.',
  progress: Math.min(cardioWorkouts.length, 5),
  target: 5,
  unit: 'séances',
  xp: 250,
  unlocked: cardioWorkouts.length >= 5,
},
{
  id: 'three-planned',
  icon: '📆',
  title: 'Sportif organisé',
  description: 'Planifie 3 séances à venir.',
  progress: Math.min(plannedWorkouts.length, 3),
  target: 3,
  unit: 'séances prévues',
  xp: 180,
  unlocked: plannedWorkouts.length >= 3,
},
{
  id: 'two-days-streak',
  icon: '🔥',
  title: 'Série lancée',
  description: 'Atteins une série de 2 jours.',
  progress: Math.min(streakStats.currentStreak, 2),
  target: 2,
  unit: 'jours',
  xp: 120,
  unlocked: streakStats.currentStreak >= 2,
},
{
  id: 'three-days-streak',
  icon: '⚡',
  title: 'Rythme trouvé',
  description: 'Atteins une série de 3 jours.',
  progress: Math.min(streakStats.currentStreak, 3),
  target: 3,
  unit: 'jours',
  xp: 220,
  unlocked: streakStats.currentStreak >= 3,
},
{
  id: 'seven-days-streak',
  icon: '👑',
  title: 'Semaine parfaite',
  description: 'Atteins une série de 7 jours.',
  progress: Math.min(streakStats.currentStreak, 7),
  target: 7,
  unit: 'jours',
  xp: 500,
  unlocked: streakStats.currentStreak >= 7,
},
  ]
}

function getCurrentWeekWorkouts(workouts: Workout[]) {
  const today = new Date()
  const day = today.getDay()
  const differenceToMonday = day === 0 ? -6 : 1 - day

  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() + differenceToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return workouts.filter((workout) => {
    const workoutDate = new Date(`${workout.date}T00:00:00`)

    return workoutDate >= startOfWeek && workoutDate <= endOfWeek
  })
}