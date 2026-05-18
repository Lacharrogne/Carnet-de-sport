import { getChallenges } from './challengeService'
import { getDailyMissions } from './missionService'

import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

type SportProfileInput = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
}

export function getProgressPercent(progress: number, target: number) {
  if (target <= 0) {
    return 0
  }

  return Math.min(Math.round((progress / target) * 100), 100)
}

export function getSportProfileXp({
  workouts,
  plannedWorkouts,
  weeklyGoal,
}: SportProfileInput) {
  const challenges = getChallenges({
    workouts,
    plannedWorkouts,
    weeklyGoal,
  })

  const dailyMissions = getDailyMissions({
    workouts,
    plannedWorkouts,
  })

  const unlockedChallenges = challenges.filter((challenge) => {
    return challenge.unlocked
  })

  const ongoingChallenges = challenges
    .filter((challenge) => {
      return !challenge.unlocked
    })
    .sort((a, b) => {
      return (
        getProgressPercent(b.progress, b.target) -
        getProgressPercent(a.progress, a.target)
      )
    })

  const completedMissions = dailyMissions.filter((mission) => {
    return mission.completed
  })

  const totalDuration = workouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const recordCount = workouts.filter((workout) => {
    return workout.trend === 'record'
  }).length

  const progressCount = workouts.filter((workout) => {
    return workout.trend === 'progress'
  }).length

  const regressCount = workouts.filter((workout) => {
    return workout.trend === 'regress'
  }).length

  const workoutXp = workouts.length * 50
  const durationXp = totalDuration * 2
  const recordXp = recordCount * 100
  const progressXp = progressCount * 40

  const challengeXp = unlockedChallenges.reduce((total, challenge) => {
    return total + challenge.xp
  }, 0)

  const missionXp = completedMissions.reduce((total, mission) => {
    return total + mission.xpReward
  }, 0)

  const totalXp =
    workoutXp +
    durationXp +
    recordXp +
    progressXp +
    challengeXp +
    missionXp

  const xpPerLevel = 500
  const level = Math.floor(totalXp / xpPerLevel) + 1
  const currentLevelXp = totalXp % xpPerLevel
  const xpToNextLevel = xpPerLevel - currentLevelXp
  const levelProgressPercent = getProgressPercent(currentLevelXp, xpPerLevel)

  return {
    totalXp,
    level,
    xpPerLevel,
    currentLevelXp,
    xpToNextLevel,
    levelProgressPercent,

    details: {
      workoutXp,
      durationXp,
      recordXp,
      progressXp,
      challengeXp,
      missionXp,
    },

    stats: {
      totalWorkouts: workouts.length,
      totalDuration,
      recordCount,
      progressCount,
      regressCount,
      unlockedChallengesCount: unlockedChallenges.length,
      challengesCount: challenges.length,
      completedMissionsCount: completedMissions.length,
      missionsCount: dailyMissions.length,
    },

    challenges,
    unlockedChallenges,
    ongoingChallenges,
    nextChallenge: ongoingChallenges[0] ?? null,

    dailyMissions,
    completedMissions,
  }
}