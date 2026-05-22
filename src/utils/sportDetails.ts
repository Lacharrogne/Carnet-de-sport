import type { SportCategoryId } from '../types/workout'

export type SportDetailMode =
  | 'strength'
  | 'endurance'
  | 'bike'
  | 'swim'
  | 'mobility'
  | 'climb'
  | 'simple'

export function getSportDetailMode(category: SportCategoryId): SportDetailMode {
  if (category === 'musculation') {
    return 'strength'
  }

  if (
    category === 'course' ||
    category === 'trail' ||
    category === 'marche' ||
    category === 'randonnee'
  ) {
    return 'endurance'
  }

  if (category === 'velo' || category === 'vtt') {
    return 'bike'
  }

  if (category === 'natation') {
    return 'swim'
  }

  if (category === 'hiit' || category === 'yoga') {
    return 'mobility'
  }

  if (category === 'escalade') {
    return 'climb'
  }

  return 'simple'
}

export function getDistanceUnit(category: SportCategoryId) {
  if (category === 'natation') {
    return 'm'
  }

  return 'km'
}

export function getElevationLabel(category: SportCategoryId) {
  if (category === 'escalade') {
    return 'Volume'
  }

  return 'Dénivelé'
}

export function getPaceLabel(category: SportCategoryId) {
  if (category === 'velo' || category === 'vtt') {
    return 'Rythme'
  }

  if (category === 'natation') {
    return 'Allure'
  }

  return 'Allure'
}