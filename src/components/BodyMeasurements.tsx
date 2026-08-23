import { useMemo, useState } from 'react'

import Button from './ui/Button'
import TrendLineChart from './charts/TrendLineChart'
import type { ChartPoint } from './charts/WeeklyBarChart'
import {
  MEASUREMENT_FIELDS,
  useMeasurements,
  type BodyMeasurementEntry,
  type MeasurementField,
} from '../services/measurementsStorage'

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(date: string): string {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return date
  }
}

const INPUT_CLASS =
  'w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/50'

export default function BodyMeasurements() {
  const { entries, addEntry, deleteEntry } = useMeasurements()

  const [date, setDate] = useState(getTodayKey)
  const [values, setValues] = useState<Record<MeasurementField, string>>({
    waist: '',
    chest: '',
    arm: '',
    thigh: '',
    hips: '',
  })
  const [chartField, setChartField] = useState<MeasurementField>('waist')

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
    [entries],
  )

  const chartData: ChartPoint[] = useMemo(
    () =>
      sorted
        .filter((entry) => typeof entry[chartField] === 'number')
        .map((entry) => ({
          label: formatDate(entry.date),
          fullLabel: entry.date,
          value: entry[chartField] as number,
        })),
    [sorted, chartField],
  )

  function handleSubmit() {
    const entry: BodyMeasurementEntry = { id: date, date }
    let hasValue = false
    for (const field of MEASUREMENT_FIELDS) {
      const raw = values[field.key].trim().replace(',', '.')
      const parsed = Number(raw)
      if (raw && !Number.isNaN(parsed) && parsed > 0) {
        entry[field.key] = parsed
        hasValue = true
      }
    }
    if (!hasValue) return
    addEntry(entry)
    setValues({ waist: '', chest: '', arm: '', thigh: '', hips: '' })
  }

  const recent = [...sorted].reverse().slice(0, 6)

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">Mensurations</h2>
          <p className="mt-1 text-sm text-slate-400">
            Suis l'évolution de ton corps (en cm), au-delà du poids.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">
          Enregistré sur cet appareil
        </span>
      </div>

      {/* Saisie */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-400">
            Date
          </span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        {MEASUREMENT_FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-400">
              {field.emoji} {field.label}
            </span>
            <input
              inputMode="decimal"
              value={values[field.key]}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  [field.key]: event.target.value,
                }))
              }
              placeholder="cm"
              className={INPUT_CLASS}
            />
          </label>
        ))}
      </div>

      <Button size="lg" onClick={handleSubmit} className="mt-4">
        Enregistrer la mensuration
      </Button>

      {/* Graphe */}
      <div className="mt-8">
        <div className="mb-3 flex flex-wrap gap-2">
          {MEASUREMENT_FIELDS.map((field) => (
            <button
              key={field.key}
              type="button"
              onClick={() => setChartField(field.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-black transition ${
                chartField === field.key
                  ? 'bg-azur-400 text-slate-950'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {field.label}
            </button>
          ))}
        </div>

        <TrendLineChart
          data={chartData}
          formatValue={(value) => `${value} cm`}
          emptyLabel="Pas encore de mesure pour cette zone."
          yBaseline="auto"
        />
      </div>

      {/* Historique récent */}
      {recent.length > 0 && (
        <div className="mt-6 space-y-2">
          {recent.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"
            >
              <span className="text-sm font-black text-white">
                {new Date(`${entry.date}T12:00:00`).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>

              <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-300">
                {MEASUREMENT_FIELDS.filter(
                  (field) => typeof entry[field.key] === 'number',
                ).map((field) => (
                  <span key={field.key}>
                    {field.emoji} {entry[field.key]} cm
                  </span>
                ))}
              </span>

              <button
                type="button"
                onClick={() => deleteEntry(entry.id)}
                className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-black text-red-200 transition hover:bg-red-400/20"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
