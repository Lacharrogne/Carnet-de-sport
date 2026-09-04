/**
 * Saisie de nombres à la française.
 *
 * `<input type="number">` n'accepte que le **point** comme séparateur décimal,
 * quelle que soit la langue du navigateur — or un clavier français produit une
 * **virgule**, y compris sur le pavé numérique. Résultat : « 4,31 » était
 * refusé avec un message incompréhensible.
 *
 * On passe donc ces champs en `type="text"` avec `inputMode="decimal"` (qui
 * fait apparaître le clavier numérique sur mobile) et on interprète nous-mêmes
 * ce qui est tapé.
 */

/**
 * Ne garde que ce qui peut composer un nombre, pendant la frappe.
 * Volontairement permissif : on laisse taper « 4, » avant « 4,31 ».
 */
export function sanitizeDecimalInput(raw: string): string {
  return raw.replace(/[^\d.,]/g, '').replace(/(?<=[.,].*)[.,]/g, '')
}

/** Nombre saisi avec une virgule ou un point. `undefined` si vide ou invalide. */
export function parseDecimal(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined

  const value = Number(trimmed.replace(',', '.'))
  return Number.isFinite(value) ? value : undefined
}

/** Affiche un nombre pour l'édition, avec la virgule française. */
export function formatDecimal(value: number | undefined): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return ''
  return String(value).replace('.', ',')
}

/**
 * Durée, en minutes.
 *
 * Trois écritures acceptées :
 *  - `28`      → 28 minutes ;
 *  - `27:58`   → 27 minutes et 58 secondes (écriture d'un chronomètre) ;
 *  - `27,5`    → 27 minutes et demie.
 *
 * Le deux-points lève l'ambiguïté : « 27,58 » vaut 27,58 minutes, alors que
 * « 27:58 » vaut bien 27 min 58 s.
 */
export function parseDuration(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined

  if (trimmed.includes(':')) {
    const [minutePart, secondPart = '0'] = trimmed.split(':')
    const minutes = Number(minutePart)
    const seconds = Number(secondPart)

    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return undefined
    if (seconds < 0 || seconds >= 60) return undefined

    // Arrondi au centième de minute : inutile de traîner 27.966666666666665.
    return Math.round((minutes + seconds / 60) * 100) / 100
  }

  return parseDecimal(trimmed)
}

/** Ne garde que ce qui peut composer une durée (chiffres, séparateurs, `:`). */
export function sanitizeDurationInput(raw: string): string {
  return raw.replace(/[^\d.,:]/g, '')
}
