import { useMemo, useState } from 'react'

import WorkoutCard from '../components/WorkoutCard'
import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { SportCategoryId, Workout } from '../types/workout'

type WorkoutsPageProps = {
  workouts: Workout[]
  onBack: () => void
  onAddWorkoutClick: () => void
  onOpenWorkout: (workoutId: string) => void
  onEditWorkout: (workoutId: string) => void
  onDeleteWorkout: (workoutId: string) => void | Promise<void>
}

type CategoryFilter = 'all' | SportCategoryId

type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'duration-desc'
  | 'duration-asc'
  | 'intensity-desc'
  | 'records-first'

export default function WorkoutsPage({
  workouts,
  onBack,
  onAddWorkoutClick,
  onOpenWorkout,
  onEditWorkout,
  onDeleteWorkout,
}: WorkoutsPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('date-desc')

  const categoryById = useMemo(() => {
    return new Map(SPORT_CATEGORIES.map((category) => [category.id, category]))
  }, [])

  const filteredWorkouts = useMemo(() => {
    const cleanedSearch = normalizeText(searchTerm)

    return [...workouts]
      .filter((workout) => {
        const matchesCategory =
          categoryFilter === 'all' || workout.category === categoryFilter

        const searchableText = getWorkoutSearchText(workout, categoryById)
        const matchesSearch =
          cleanedSearch.length === 0 || searchableText.includes(cleanedSearch)

        return matchesCategory && matchesSearch
      })
      .sort((a, b) => sortWorkouts(a, b, sortOption))
  }, [workouts, searchTerm, categoryFilter, sortOption, categoryById])

  const totalDuration = useMemo(() => {
    return workouts.reduce((total, workout) => {
      return total + workout.duration
    }, 0)
  }, [workouts])

  const recordCount = useMemo(() => {
    return workouts.filter((workout) => {
      return workout.trend === 'record'
    }).length
  }, [workouts])

  const averageDuration =
    workouts.length > 0 ? Math.round(totalDuration / workouts.length) : 0

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    categoryFilter !== 'all' ||
    sortOption !== 'date-desc'

  const resetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setSortOption('date-desc')
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          ← Retour au dashboard
        </button>

        <header className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm sm:p-7 lg:p-8">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Carnet de séances
              </p>

              <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Tout ton historique sportif.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Retrouve tes séances, filtre par sport, trie ton historique et
                garde une trace claire de ta progression.
              </p>
            </div>

            <button
              type="button"
              onClick={onAddWorkoutClick}
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              + Ajouter une séance
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Séances affichées"
            value={String(filteredWorkouts.length)}
            detail={`${workouts.length} au total`}
          />

          <StatCard
            label="Temps total"
            value={formatDuration(totalDuration)}
            detail="activité enregistrée"
          />

          <StatCard
            label="Durée moyenne"
            value={formatDuration(averageDuration)}
            detail="par séance"
          />

          <StatCard
            label="Records"
            value={`${recordCount} 🔥`}
            detail="séances marquantes"
            highlighted
          />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-600">
                Recherche
              </span>

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher une séance, une note, un exercice..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-600">
                Sport
              </span>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as CategoryFilter)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">Tous les sports</option>

                {SPORT_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-600">
                Tri
              </span>

              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as SortOption)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="date-desc">Plus récentes</option>
                <option value="date-asc">Plus anciennes</option>
                <option value="duration-desc">Durée décroissante</option>
                <option value="duration-asc">Durée croissante</option>
                <option value="intensity-desc">Intensité forte d’abord</option>
                <option value="records-first">Records d’abord</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={[
                'rounded-full border px-4 py-2 text-xs font-bold transition',
                categoryFilter === 'all'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
              ].join(' ')}
            >
              Tous
            </button>

            {SPORT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryFilter(category.id)}
                className={[
                  'rounded-full border px-4 py-2 text-xs font-bold transition',
                  categoryFilter === category.id
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
                ].join(' ')}
              >
                {category.emoji} {category.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          {filteredWorkouts.length > 0 ? (
            <>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                    Historique
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                    {filteredWorkouts.length} séance
                    {filteredWorkouts.length > 1 ? 's' : ''} trouvée
                    {filteredWorkouts.length > 1 ? 's' : ''}
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {filteredWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onOpen={onOpenWorkout}
                    onEdit={onEditWorkout}
                    onDelete={onDeleteWorkout}
                  />
                ))}
              </div>
            </>
          ) : workouts.length === 0 ? (
            <EmptyState
              icon="🏁"
              title="Aucune séance enregistrée."
              description="Ajoute ta première séance pour commencer à suivre ta progression, tes records et ton temps d’entraînement."
              actionLabel="+ Ajouter ma première séance"
              onAction={onAddWorkoutClick}
            />
          ) : (
            <EmptyState
              icon="🔎"
              title="Aucun entraînement trouvé."
              description="Essaie de modifier ta recherche, ton sport ou ton tri pour retrouver tes séances."
              actionLabel="Réinitialiser les filtres"
              onAction={resetFilters}
              secondary
            />
          )}
        </section>
      </section>
    </main>
  )
}

function StatCard({
  label,
  value,
  detail,
  highlighted = false,
}: {
  label: string
  value: string
  detail: string
  highlighted?: boolean
}) {
  return (
    <div
      className={[
        'rounded-2xl border p-5 shadow-sm',
        highlighted
          ? 'border-amber-200 bg-amber-50'
          : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <p
        className={[
          'text-xs font-bold uppercase tracking-wide',
          highlighted ? 'text-amber-600' : 'text-slate-400',
        ].join(' ')}
      >
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondary = false,
}: {
  icon: string
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  secondary?: boolean
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-5xl">{icon}</p>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">{title}</h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onAction}
        className={[
          'mt-6 rounded-full px-6 py-3 text-sm font-bold transition',
          secondary
            ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            : 'bg-emerald-600 text-white hover:bg-emerald-700',
        ].join(' ')}
      >
        {actionLabel}
      </button>
    </div>
  )
}

function getWorkoutSearchText(
  workout: Workout,
  categoryById: Map<SportCategoryId, (typeof SPORT_CATEGORIES)[number]>,
) {
  const category = categoryById.get(workout.category)
  const details = workout.details

  const strengthExerciseText =
    details?.strengthExercises
      ?.map((exercise) => {
        return [
          exercise.name,
          exercise.notes,
          exercise.sets,
          exercise.reps,
          exercise.weight,
          exercise.rest,
        ]
          .filter(Boolean)
          .join(' ')
      })
      .join(' ') ?? ''

  return normalizeText(
    [
      workout.title,
      workout.notes,
      workout.improvementIdea,
      category?.label,
      workout.intensity,
      workout.feeling,
      workout.trend,
      details?.exercises,
      details?.sets,
      details?.reps,
      details?.weight,
      details?.distance,
      details?.pace,
      details?.swimmingStyle,
      details?.position,
      details?.goals,
      details?.assists,
      details?.elevation,
      details?.bodyZones,
      strengthExerciseText,
    ]
      .filter(Boolean)
      .join(' '),
  )
}

function sortWorkouts(a: Workout, b: Workout, sortOption: SortOption) {
  const dateA = new Date(`${a.date}T00:00:00`).getTime()
  const dateB = new Date(`${b.date}T00:00:00`).getTime()

  if (sortOption === 'date-desc') {
    return dateB - dateA
  }

  if (sortOption === 'date-asc') {
    return dateA - dateB
  }

  if (sortOption === 'duration-desc') {
    return b.duration - a.duration
  }

  if (sortOption === 'duration-asc') {
    return a.duration - b.duration
  }

  if (sortOption === 'intensity-desc') {
    return getIntensityScore(b.intensity) - getIntensityScore(a.intensity)
  }

  if (sortOption === 'records-first') {
    const recordA = a.trend === 'record' ? 1 : 0
    const recordB = b.trend === 'record' ? 1 : 0

    if (recordA !== recordB) {
      return recordB - recordA
    }

    return dateB - dateA
  }

  return dateB - dateA
}

function getIntensityScore(intensity: Workout['intensity']) {
  const normalizedIntensity = normalizeText(String(intensity))

  const scores: Record<string, number> = {
    faible: 1,
    basse: 1,
    leger: 1,
    legere: 1,
    facile: 1,

    moyenne: 2,
    moyen: 2,
    moderee: 2,
    normal: 2,

    forte: 3,
    elevee: 3,
    intense: 3,
    difficile: 3,
  }

  return scores[normalizedIntensity] ?? 0
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes} min`
}