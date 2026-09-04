import { describe, expect, it } from 'vitest'

import { estimateWorkoutCalories, getTotalCalories } from './caloriesService'
import type { Workout } from '../types/workout'

const seance = (patch: Partial<Workout> = {}): Workout =>
  ({
    category: 'Course',
    intensity: 'Moyenne',
    duration: 60,
    date: '2026-09-04',
    ...patch,
  }) as unknown as Workout

/**
 * Estimation : kcal ≈ MET × facteur d'intensité × poids(kg) × durée(h).
 * Les valeurs exactes dépendent du barème MET ; on vérifie ici les
 * comportements qui doivent rester vrais quel que soit le barème.
 */
describe('estimateWorkoutCalories', () => {
  it('renvoie un nombre entier positif sur une séance normale', () => {
    const kcal = estimateWorkoutCalories(seance(), 70)
    expect(kcal).toBeGreaterThan(0)
    expect(Number.isInteger(kcal)).toBe(true)
  })

  it('croît proportionnellement à la durée', () => {
    const uneHeure = estimateWorkoutCalories(seance({ duration: 60 }), 70)
    const deuxHeures = estimateWorkoutCalories(seance({ duration: 120 }), 70)
    expect(deuxHeures).toBe(uneHeure * 2)
  })

  it('croît avec le poids de la personne', () => {
    expect(estimateWorkoutCalories(seance(), 90)).toBeGreaterThan(
      estimateWorkoutCalories(seance(), 60),
    )
  })

  it('classe les intensités dans le bon ordre', () => {
    const facile = estimateWorkoutCalories(seance({ intensity: 'Facile' }), 70)
    const moyenne = estimateWorkoutCalories(seance({ intensity: 'Moyenne' }), 70)
    const difficile = estimateWorkoutCalories(seance({ intensity: 'Difficile' }), 70)
    expect(facile).toBeLessThan(moyenne)
    expect(moyenne).toBeLessThan(difficile)
  })

  it('renvoie 0 plutôt qu’un chiffre absurde si le poids est inconnu', () => {
    expect(estimateWorkoutCalories(seance(), 0)).toBe(0)
    expect(estimateWorkoutCalories(seance(), -70)).toBe(0)
  })

  it('renvoie 0 pour une séance de durée nulle', () => {
    expect(estimateWorkoutCalories(seance({ duration: 0 }), 70)).toBe(0)
  })

  it('retombe sur une valeur par défaut pour une catégorie inconnue', () => {
    const kcal = estimateWorkoutCalories(
      seance({ category: 'Chasse au trésor' as Workout['category'] }),
      70,
    )
    expect(kcal).toBeGreaterThan(0)
  })
})

describe('getTotalCalories', () => {
  it('additionne les séances', () => {
    const une = estimateWorkoutCalories(seance(), 70)
    expect(getTotalCalories([seance(), seance()], 70)).toBe(une * 2)
  })

  it('vaut 0 sans aucune séance', () => {
    expect(getTotalCalories([], 70)).toBe(0)
  })
})
