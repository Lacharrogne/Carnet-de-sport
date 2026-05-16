import { useState, type FormEvent } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type {
  SportCategoryId,
  WorkoutDetails,
  WorkoutFeeling,
  WorkoutFormValues,
  WorkoutIntensity,
  WorkoutTrend,
} from '../types/workout'

type WorkoutFormProps = {
  initialValues?: WorkoutFormValues
  submitLabel?: string
  onSubmit: (values: WorkoutFormValues) => void
  onCancel: () => void
}

const intensityOptions: WorkoutIntensity[] = ['Facile', 'Moyenne', 'Difficile']

const feelingOptions: WorkoutFeeling[] = [
  'Très mauvais',
  'Mauvais',
  'Correct',
  'Bon',
  'Excellent',
]

const trendOptions: { value: WorkoutTrend; label: string; emoji: string }[] = [
  { value: 'first', label: 'Première séance', emoji: '🌱' },
  { value: 'progress', label: 'Progression', emoji: '📈' },
  { value: 'stable', label: 'Stable', emoji: '⚖️' },
  { value: 'regress', label: 'Régression', emoji: '📉' },
  { value: 'record', label: 'Record', emoji: '🔥' },
]

export default function WorkoutForm({
  initialValues,
  submitLabel = 'Enregistrer la séance',
  onSubmit,
  onCancel,
}: WorkoutFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [category, setCategory] = useState<SportCategoryId>(
    initialValues?.category ?? 'musculation'
  )
  const [date, setDate] = useState(initialValues?.date ?? today)
  const [duration, setDuration] = useState(
    initialValues?.duration ? String(initialValues.duration) : ''
  )
  const [intensity, setIntensity] = useState<WorkoutIntensity>(
    initialValues?.intensity ?? 'Moyenne'
  )
  const [feeling, setFeeling] = useState<WorkoutFeeling>(
    initialValues?.feeling ?? 'Bon'
  )
  const [trend, setTrend] = useState<WorkoutTrend>(
    initialValues?.trend ?? 'first'
  )
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [improvementIdea, setImprovementIdea] = useState(
    initialValues?.improvementIdea ?? ''
  )

  const [details, setDetails] = useState<WorkoutDetails>(
    initialValues?.details ?? {}
  )

  const updateDetail = <Key extends keyof WorkoutDetails>(
    key: Key,
    value: WorkoutDetails[Key]
  ) => {
    setDetails((currentDetails) => ({
      ...currentDetails,
      [key]: value,
    }))
  }

  const handleCategoryChange = (newCategory: SportCategoryId) => {
    setCategory(newCategory)
    setDetails({})
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const cleanedTitle = title.trim()
    const cleanedDuration = Number(duration)

    if (!cleanedTitle) {
      alert('Donne un nom à ta séance.')
      return
    }

    if (!duration || cleanedDuration <= 0) {
      alert('Ajoute une durée valide.')
      return
    }

    onSubmit({
      title: cleanedTitle,
      category,
      date,
      duration: cleanedDuration,
      intensity,
      feeling,
      notes: notes.trim(),
      improvementIdea: improvementIdea.trim(),
      trend,
      details,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">
            Nom de la séance
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex : Séance jambes"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Catégorie</span>
          <select
            value={category}
            onChange={(event) =>
              handleCategoryChange(event.target.value as SportCategoryId)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
          >
            {SPORT_CATEGORIES.map((sportCategory) => (
              <option key={sportCategory.id} value={sportCategory.id}>
                {sportCategory.emoji} {sportCategory.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">
            Durée en minutes
          </span>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="Ex : 45"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Intensité</span>
          <select
            value={intensity}
            onChange={(event) =>
              setIntensity(event.target.value as WorkoutIntensity)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
          >
            {intensityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Ressenti</span>
          <select
            value={feeling}
            onChange={(event) =>
              setFeeling(event.target.value as WorkoutFeeling)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
          >
            {feelingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <SportSpecificFields
        category={category}
        details={details}
        onChange={updateDetail}
      />

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-200">
          Progression ressentie
        </span>
        <select
          value={trend}
          onChange={(event) => setTrend(event.target.value as WorkoutTrend)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
        >
          {trendOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.emoji} {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-200">
          Notes sur la séance
        </span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="Ex : Bonne séance, mais j’ai manqué d’énergie sur la fin."
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-200">
          Idée d’amélioration pour la prochaine fois
        </span>
        <textarea
          value={improvementIdea}
          onChange={(event) => setImprovementIdea(event.target.value)}
          rows={3}
          placeholder="Ex : Mieux gérer les temps de repos ou ajouter 5 minutes de cardio."
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
        />
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10"
        >
          Annuler
        </button>

        <button
          type="submit"
          className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

type SportSpecificFieldsProps = {
  category: SportCategoryId
  details: WorkoutDetails
  onChange: <Key extends keyof WorkoutDetails>(
    key: Key,
    value: WorkoutDetails[Key]
  ) => void
}

function SportSpecificFields({
  category,
  details,
  onChange,
}: SportSpecificFieldsProps) {
  return (
    <section className="rounded-[2rem] border border-emerald-400/10 bg-emerald-400/5 p-5">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
        Détails spécifiques
      </p>

      <p className="mt-2 text-sm text-slate-400">
        Ces champs changent selon le sport choisi.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {category === 'musculation' ? (
          <>
            <TextField
              label="Exercices réalisés"
              value={details.exercises ?? ''}
              placeholder="Ex : Développé couché, rowing, tractions"
              onChange={(value) => onChange('exercises', value)}
            />

            <NumberDetailField
              label="Nombre de séries"
              value={details.sets}
              placeholder="Ex : 4"
              onChange={(value) => onChange('sets', value)}
            />

            <NumberDetailField
              label="Répétitions moyennes"
              value={details.reps}
              placeholder="Ex : 10"
              onChange={(value) => onChange('reps', value)}
            />

            <NumberDetailField
              label="Charge principale en kg"
              value={details.weight}
              placeholder="Ex : 60"
              onChange={(value) => onChange('weight', value)}
            />
          </>
        ) : null}

        {category === 'course' || category === 'marche' ? (
          <>
            <NumberDetailField
              label="Distance en km"
              value={details.distance}
              placeholder="Ex : 5"
              onChange={(value) => onChange('distance', value)}
            />

            <TextField
              label="Allure"
              value={details.pace ?? ''}
              placeholder="Ex : 6:20 / km"
              onChange={(value) => onChange('pace', value)}
            />
          </>
        ) : null}

        {category === 'natation' ? (
          <>
            <NumberDetailField
              label="Distance en mètres"
              value={details.distance}
              placeholder="Ex : 1000"
              onChange={(value) => onChange('distance', value)}
            />

            <TextField
              label="Type de nage"
              value={details.swimmingStyle ?? ''}
              placeholder="Ex : crawl, brasse, dos"
              onChange={(value) => onChange('swimmingStyle', value)}
            />
          </>
        ) : null}

        {category === 'football' ? (
          <>
            <TextField
              label="Poste joué"
              value={details.position ?? ''}
              placeholder="Ex : ailier, défenseur, gardien"
              onChange={(value) => onChange('position', value)}
            />

            <NumberDetailField
              label="Buts"
              value={details.goals}
              placeholder="Ex : 2"
              onChange={(value) => onChange('goals', value)}
            />

            <NumberDetailField
              label="Passes décisives"
              value={details.assists}
              placeholder="Ex : 1"
              onChange={(value) => onChange('assists', value)}
            />
          </>
        ) : null}

        {category === 'velo' ? (
          <>
            <NumberDetailField
              label="Distance en km"
              value={details.distance}
              placeholder="Ex : 25"
              onChange={(value) => onChange('distance', value)}
            />

            <NumberDetailField
              label="Dénivelé en mètres"
              value={details.elevation}
              placeholder="Ex : 300"
              onChange={(value) => onChange('elevation', value)}
            />
          </>
        ) : null}

        {category === 'mobilite' ? (
          <TextField
            label="Zones travaillées"
            value={details.bodyZones ?? ''}
            placeholder="Ex : hanches, épaules, dos"
            onChange={(value) => onChange('bodyZones', value)}
          />
        ) : null}

        {category === 'autre' ? (
          <TextField
            label="Détails de la séance"
            value={details.exercises ?? ''}
            placeholder="Ex : type d’activité, sensations, objectif"
            onChange={(value) => onChange('exercises', value)}
          />
        ) : null}
      </div>
    </section>
  )
}

type TextFieldProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-200">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
      />
    </label>
  )
}

type NumberDetailFieldProps = {
  label: string
  value?: number
  placeholder: string
  onChange: (value: number | undefined) => void
}

function NumberDetailField({
  label,
  value,
  placeholder,
  onChange,
}: NumberDetailFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-200">
        {label}
      </span>
      <input
        type="number"
        min="0"
        value={value ?? ''}
        onChange={(event) => {
          const newValue = event.target.value

          onChange(newValue === '' ? undefined : Number(newValue))
        }}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
      />
    </label>
  )
}