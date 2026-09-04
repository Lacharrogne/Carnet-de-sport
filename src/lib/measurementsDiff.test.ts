import { describe, expect, it } from 'vitest'

import { diffMeasurements, hasAnyMeasure } from './measurementsDiff'
import type { BodyMeasurementEntry } from '../services/measurementsStorage'

const entry = (
  date: string,
  measures: Partial<Record<'waist' | 'chest' | 'arm', number>> = {},
): BodyMeasurementEntry => ({ id: date, date, ...measures })

describe('hasAnyMeasure', () => {
  it('reconnaît une série renseignée', () => {
    expect(hasAnyMeasure(entry('2026-09-04', { waist: 82 }))).toBe(true)
  })

  it('reconnaît une série vide', () => {
    expect(hasAnyMeasure(entry('2026-09-04'))).toBe(false)
  })
})

describe('diffMeasurements', () => {
  it('ne produit rien quand rien ne change', () => {
    const list = [entry('2026-09-04', { waist: 82 })]
    expect(diffMeasurements(list, list)).toEqual([])
  })

  it('écrit une nouvelle série', () => {
    const ops = diffMeasurements([], [entry('2026-09-04', { waist: 82 })])
    expect(ops).toEqual([
      { type: 'set', entry: entry('2026-09-04', { waist: 82 }) },
    ])
  })

  it('écrit une série dont une mesure a changé', () => {
    const ops = diffMeasurements(
      [entry('2026-09-04', { waist: 82 })],
      [entry('2026-09-04', { waist: 81 })],
    )
    expect(ops).toHaveLength(1)
    expect(ops[0].type).toBe('set')
  })

  it('ne touche pas aux autres dates', () => {
    const ops = diffMeasurements(
      [entry('2026-09-01', { waist: 84 }), entry('2026-09-04', { waist: 82 })],
      [entry('2026-09-01', { waist: 84 }), entry('2026-09-04', { waist: 81 })],
    )
    expect(ops).toEqual([
      { type: 'set', entry: entry('2026-09-04', { waist: 81 }) },
    ])
  })

  it('supprime une série retirée de la liste', () => {
    const ops = diffMeasurements([entry('2026-09-04', { waist: 82 })], [])
    expect(ops).toEqual([{ type: 'delete', date: '2026-09-04' }])
  })

  it('traite une série vidée comme une suppression', () => {
    // La base refuse une ligne entièrement vide : il faut supprimer, pas écrire.
    const ops = diffMeasurements(
      [entry('2026-09-04', { waist: 82 })],
      [entry('2026-09-04')],
    )
    expect(ops).toEqual([{ type: 'delete', date: '2026-09-04' }])
  })

  it('n’écrit jamais une série vide', () => {
    const ops = diffMeasurements([], [entry('2026-09-04')])
    expect(ops).toEqual([])
  })

  it('n’envoie AUCUNE suppression sans état de référence', () => {
    // Sans savoir ce que contient le compte, supprimer effacerait
    // l'historique saisi sur un autre appareil.
    expect(diffMeasurements(null, [])).toEqual([])
  })

  it('remplit sans rien supprimer quand la référence est inconnue', () => {
    const ops = diffMeasurements(null, [entry('2026-09-04', { arm: 35 })])
    expect(ops).toEqual([
      { type: 'set', entry: entry('2026-09-04', { arm: 35 }) },
    ])
  })
})
