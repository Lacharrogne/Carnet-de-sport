import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { BodyWeightEntry } from '../types/bodyWeight'
import type { Workout } from '../types/workout'

/**
 * Export CSV « maison » (sans dépendance), pensé pour Excel/LibreOffice en
 * français : séparateur point-virgule, décimales à la virgule, BOM UTF-8.
 */

function escapeCell(value: string): string {
  const text = value ?? ''
  const needsQuotes = /[";\n]/.test(text)
  const escaped = text.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function toCsv(header: string[], rows: string[][]): string {
  const lines = [header, ...rows].map((cells) => cells.map(escapeCell).join(';'))
  return '﻿' + lines.join('\r\n')
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

function categoryLabel(id: string): string {
  return SPORT_CATEGORIES.find((category) => category.id === id)?.label ?? id
}

/** Résumé compact des exercices de muscu d'une séance. */
function summarizeExercises(workout: Workout): string {
  const list = workout.details?.strengthExercises
  if (list && list.length > 0) {
    return list
      .filter((exercise) => exercise.name.trim())
      .map((exercise) => {
        const parts = [exercise.name.trim()]
        const setsReps = [exercise.sets, exercise.reps].filter(Boolean).join('×')
        if (setsReps) parts.push(setsReps)
        if (exercise.weight) parts.push(`@${exercise.weight}`)
        return parts.join(' ')
      })
      .join(' | ')
  }

  const details = workout.details
  if (!details) return ''
  const bits: string[] = []
  if (details.distance) bits.push(`${details.distance} km`)
  if (details.pace) bits.push(details.pace)
  return bits.join(' · ')
}

export function exportWorkoutsToCsv(workouts: Workout[]) {
  const header = [
    'Date',
    'Titre',
    'Catégorie',
    'Durée (min)',
    'Intensité',
    'Ressenti',
    'Tendance',
    'Détails',
    'Notes',
  ]

  const rows = [...workouts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((workout) => [
      workout.date,
      workout.title,
      categoryLabel(workout.category),
      String(workout.duration ?? ''),
      workout.intensity,
      workout.feeling,
      workout.trend,
      summarizeExercises(workout),
      workout.notes ?? '',
    ])

  download(`seances-${todayStamp()}.csv`, toCsv(header, rows))
}

export function exportBodyWeightToCsv(entries: BodyWeightEntry[]) {
  const header = ['Date', 'Poids (kg)', 'Note']

  const rows = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((entry) => [
      entry.date,
      String(entry.weight).replace('.', ','),
      entry.note ?? '',
    ])

  download(`poids-${todayStamp()}.csv`, toCsv(header, rows))
}
