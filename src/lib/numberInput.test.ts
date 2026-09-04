import { describe, expect, it } from 'vitest'

import {
  formatDecimal,
  parseDecimal,
  parseDuration,
  sanitizeDecimalInput,
  sanitizeDurationInput,
} from './numberInput'

describe('parseDecimal — la virgule française', () => {
  it('accepte la virgule', () => {
    expect(parseDecimal('4,31')).toBe(4.31)
  })

  it('accepte aussi le point', () => {
    expect(parseDecimal('4.31')).toBe(4.31)
  })

  it('accepte un entier', () => {
    expect(parseDecimal('16')).toBe(16)
  })

  it('ignore les espaces autour', () => {
    expect(parseDecimal('  4,31  ')).toBe(4.31)
  })

  it('rend undefined sur une saisie vide', () => {
    expect(parseDecimal('')).toBeUndefined()
    expect(parseDecimal('   ')).toBeUndefined()
  })

  it('rend undefined sur une saisie insensée', () => {
    expect(parseDecimal('abc')).toBeUndefined()
  })
})

describe('parseDuration — minutes, ou chronomètre', () => {
  it('lit un nombre entier de minutes', () => {
    expect(parseDuration('28')).toBe(28)
  })

  it('lit un chronomètre mm:ss', () => {
    // 27 min 58 s = 27,9666… → arrondi au centième
    expect(parseDuration('27:58')).toBe(27.97)
  })

  it('lit une demi-minute en décimal', () => {
    expect(parseDuration('27,5')).toBe(27.5)
  })

  it('distingue bien « 27:58 » de « 27,58 »', () => {
    // Le deux-points, c'est 58 secondes ; la virgule, 58 centièmes de minute.
    expect(parseDuration('27:58')).not.toBe(parseDuration('27,58'))
    expect(parseDuration('27,58')).toBe(27.58)
  })

  it('accepte mm:ss sans secondes', () => {
    expect(parseDuration('30:')).toBe(30)
  })

  it('refuse des secondes impossibles', () => {
    expect(parseDuration('27:60')).toBeUndefined()
    expect(parseDuration('27:99')).toBeUndefined()
  })

  it('rend undefined sur une saisie vide', () => {
    expect(parseDuration('')).toBeUndefined()
  })
})

describe('formatDecimal — réaffichage', () => {
  it('réaffiche avec une virgule', () => {
    expect(formatDecimal(4.31)).toBe('4,31')
  })

  it('laisse un entier tel quel', () => {
    expect(formatDecimal(16)).toBe('16')
  })

  it('rend une chaîne vide si rien à afficher', () => {
    expect(formatDecimal(undefined)).toBe('')
  })

  it('fait l’aller-retour sans perte', () => {
    expect(parseDecimal(formatDecimal(4.31))).toBe(4.31)
  })
})

describe('sanitize — pendant la frappe', () => {
  it('laisse taper une virgule en cours de saisie', () => {
    expect(sanitizeDecimalInput('4,')).toBe('4,')
  })

  it('retire les lettres', () => {
    expect(sanitizeDecimalInput('4a,3b1')).toBe('4,31')
  })

  it('refuse un deuxième séparateur', () => {
    expect(sanitizeDecimalInput('4,3,1')).toBe('4,31')
  })

  it('laisse passer le deux-points pour une durée', () => {
    expect(sanitizeDurationInput('27:58')).toBe('27:58')
    expect(sanitizeDurationInput('27h58')).toBe('2758')
  })
})

describe('Régression — la saisie refusée le 4 septembre 2026', () => {
  // Un footing : 4,31 km en 27:58, 16 m de dénivelé. Chaque champ était
  // rejeté par le navigateur avec « les deux valeurs valides les plus
  // proches sont 4 et 5 ».
  it('accepte une distance à virgule', () => {
    expect(parseDecimal(sanitizeDecimalInput('4,31'))).toBe(4.31)
  })

  it('accepte une durée au chronomètre', () => {
    expect(parseDuration(sanitizeDurationInput('27:58'))).toBe(27.97)
  })

  it('accepte un dénivelé entier', () => {
    expect(parseDecimal(sanitizeDecimalInput('16'))).toBe(16)
  })

  it('ne perd pas la virgule pendant la frappe', () => {
    // Le piège : « 4, » ne doit pas être réécrit en « 4 » entre deux touches.
    expect(sanitizeDecimalInput('4')).toBe('4')
    expect(sanitizeDecimalInput('4,')).toBe('4,')
    expect(sanitizeDecimalInput('4,3')).toBe('4,3')
    expect(sanitizeDecimalInput('4,31')).toBe('4,31')
  })
})
