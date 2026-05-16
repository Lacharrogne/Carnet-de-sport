import type { Workout } from '../types/workout'

export type StreakStats = {
  currentStreak: number
  lastWorkoutLabel: string
  hasWorkoutToday: boolean
}

export function getStreakStats(workouts: Workout[]): StreakStats {
  const today = getDateKey(new Date())

  const workoutDays = Array.from(
    new Set(
      workouts
        .map((workout) => workout.date)
        .filter((date) => date <= today)
    )
  ).sort((a, b) => {
    return new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()
  })

  if (workoutDays.length === 0) {
    return {
      currentStreak: 0,
      lastWorkoutLabel: 'Aucune séance enregistrée',
      hasWorkoutToday: false,
    }
  }

  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = getDateKey(yesterdayDate)

  const hasWorkoutToday = workoutDays.includes(today)
  const hasWorkoutYesterday = workoutDays.includes(yesterday)

  let streakStartDate: Date

  if (hasWorkoutToday) {
    streakStartDate = new Date(`${today}T00:00:00`)
  } else if (hasWorkoutYesterday) {
    streakStartDate = new Date(`${yesterday}T00:00:00`)
  } else {
    return {
      currentStreak: 0,
      lastWorkoutLabel: getLastWorkoutLabel(workoutDays[0]),
      hasWorkoutToday: false,
    }
  }

  let currentStreak = 0
  const currentDate = new Date(streakStartDate)

  while (workoutDays.includes(getDateKey(currentDate))) {
    currentStreak += 1
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return {
    currentStreak,
    lastWorkoutLabel: getLastWorkoutLabel(workoutDays[0]),
    hasWorkoutToday,
  }
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getLastWorkoutLabel(date: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const workoutDate = new Date(`${date}T00:00:00`)
  workoutDate.setHours(0, 0, 0, 0)

  const differenceInDays = Math.round(
    (today.getTime() - workoutDate.getTime()) / 86_400_000
  )

  if (differenceInDays === 0) {
    return 'Dernière séance aujourd’hui'
  }

  if (differenceInDays === 1) {
    return 'Dernière séance hier'
  }

  return `Dernière séance il y a ${differenceInDays} jours`
}