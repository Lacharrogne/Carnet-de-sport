import { describe, expect, it } from 'vitest'

import { estimateOneRepMax } from './progressiveOverloadService'

/**
 * Le 1RM estimé sert à proposer une charge de travail : une erreur ici
 * suggérerait des poids inadaptés, avec un vrai risque de blessure.
 */
describe('estimateOneRepMax — formule d’Epley', () => {
  it('renvoie la charge elle-même sur une répétition', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100)
  })

  it('applique charge × (1 + reps/30)', () => {
    // 100 × (1 + 10/30) = 133,33 → 133
    expect(estimateOneRepMax(100, 10)).toBe(133)
    // 80 × (1 + 5/30) = 93,33 → 93
    expect(estimateOneRepMax(80, 5)).toBe(93)
  })

  it('arrondit au kilo le plus proche', () => {
    expect(Number.isInteger(estimateOneRepMax(62.5, 7))).toBe(true)
  })

  it('croît avec le nombre de répétitions à charge égale', () => {
    const cinq = estimateOneRepMax(100, 5)!
    const dix = estimateOneRepMax(100, 10)!
    expect(dix).toBeGreaterThan(cinq)
  })

  it('refuse de calculer sur des valeurs absentes ou aberrantes', () => {
    expect(estimateOneRepMax(0, 10)).toBeNull()
    expect(estimateOneRepMax(100, 0)).toBeNull()
    expect(estimateOneRepMax(-50, 10)).toBeNull()
    expect(estimateOneRepMax(100, -3)).toBeNull()
  })
})
