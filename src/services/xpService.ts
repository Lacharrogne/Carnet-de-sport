import { getChallenges } from './challengeService'
import { getDailyMissions } from './missionService'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

const XP_PER_LEVEL = 500

type GetSportProfileXpParams = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
}

export function getSportProfileXp({
  workouts,
  plannedWorkouts,
  weeklyGoal,
}: GetSportProfileXpParams) {
  const totalDuration = workouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const recordCount = workouts.filter((workout) => {
    return workout.trend === 'record'
  }).length

  const progressCount = workouts.filter((workout) => {
    return workout.trend === 'progress'
  }).length

  const challenges = getChallenges({
    workouts,
    plannedWorkouts,
    weeklyGoal,
  })

  const unlockedChallenges = challenges.filter((challenge) => {
    return challenge.unlocked
  })

  const challengeXp = unlockedChallenges.reduce((total, challenge) => {
    return total + challenge.xp
  }, 0)

  const missions = getDailyMissions({
    workouts,
    plannedWorkouts,
  })

  const completedMissions = missions.filter((mission) => {
    return mission.completed
  })

  const missionXp = completedMissions.reduce((total, mission) => {
    return total + mission.xpReward
  }, 0)

  const workoutXp = workouts.length * 50
  const durationXp = totalDuration * 2
  const recordXp = recordCount * 100
  const progressXp = progressCount * 40

  const totalXp =
    workoutXp +
    durationXp +
    recordXp +
    progressXp +
    challengeXp +
    missionXp

  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const currentLevelXp = totalXp % XP_PER_LEVEL
  const xpToNextLevel = XP_PER_LEVEL - currentLevelXp
  const levelProgressPercent = Math.min(
    Math.round((currentLevelXp / XP_PER_LEVEL) * 100),
    100,
  )

  return {
    totalXp,
    level,
    currentLevelXp,
    xpToNextLevel,
    xpPerLevel: XP_PER_LEVEL,
    levelProgressPercent,
    details: {
      workoutXp,
      durationXp,
      recordXp,
      progressXp,
      challengeXp,
      missionXp,
    },
  }
}