import { useMemo, useState } from 'react'

import WorkoutCard from '../components/WorkoutCard'
import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { SportCategoryId, Workout } from '../types/workout'

type WorkoutsPageProps = {
  workouts: Workout[]
  onBack: () => void
  onAddWorkoutClick: () => void
  onEditWorkout: (workoutId: string) => void
  onDeleteWorkout: (workoutId: string) => void | Promise<void>
}

type CategoryFilter = 'all' | SportCategoryId

export default function WorkoutsPage({
  workouts,
  onBack,
  onAddWorkoutClick,
  onEditWorkout,
  onDeleteWorkout,
}: WorkoutsPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const categoryById = useMemo(() => {
    return new Map(SPORT_CATEGORIES.map((category) => [category.id, category]))
  }, [])

  const filteredWorkouts = useMemo(() => {
    const cleanedSearch = searchTerm.trim().toLowerCase()

    return [...workouts]
      .sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      .filter((workout) => {
        const category = categoryById.get(workout.category)

        const matchesCategory =
          categoryFilter === 'all' || workout.category === categoryFilter

        const searchableText = [
          workout.title,
          workout.notes,
          workout.improvementIdea,
          category?.label,
          workout.intensity,
          workout.feeling,
          workout.trend,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        const matchesSearch =
          cleanedSearch.length === 0 || searchableText.includes(cleanedSearch)

        return matchesCategory && matchesSearch
      })
  }, [workouts, searchTerm, categoryFilter, categoryById])

  const totalDuration = useMemo(() => {
    return workouts.reduce((total, workout) => total + workout.duration, 0)
  }, [workouts])

  const recordCount = useMemo(() => {
    return workouts.filter((workout) => workout.trend === 'record').length
  }, [workouts])

  const hasActiveFilters = searchTerm.trim() !== '' || categoryFilter !== 'all'

  const resetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
  }

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
        >
          ← Retour au dashboard
        </button>

        <header className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Mes entraînements
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
                Tout ton historique sportif.
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Retrouve tes séances, filtre par sport et observe ta régularité.
              </p>
            </div>

            <button
              type="button"
              onClick={onAddWorkoutClick}
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
            >
              + Ajouter une séance
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-semibold text-slate-400">
              Séances affichées
            </p>
            <p className="mt-3 text-4xl font-black">
              {filteredWorkouts.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-semibold text-slate-400">
              Total enregistré
            </p>
            <p className="mt-3 text-4xl font-black">{workouts.length}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-semibold text-slate-400">
              Temps total
            </p>
            <p className="mt-3 text-4xl font-black">{totalDuration} min</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-semibold text-slate-400">Records</p>
            <p className="mt-3 text-4xl font-black">{recordCount} 🔥</p>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px_auto]">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher une séance, une note, une intensité..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
            />

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value as CategoryFilter)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
            >
              <option value="all">Tous les sports</option>

              {SPORT_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.emoji} {category.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Réinitialiser
            </button>
          </div>
        </section>

        <section className="mt-8">
          {filteredWorkouts.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onEdit={onEditWorkout}
                  onDelete={onDeleteWorkout}
                />
              ))}
            </div>
          ) : workouts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <p className="text-5xl">🏁</p>

              <h2 className="mt-4 text-2xl font-black">
                Aucune séance enregistrée.
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-slate-400">
                Ajoute ta première séance pour commencer à suivre ta
                progression, tes records et ton temps d’entraînement.
              </p>

              <button
                type="button"
                onClick={onAddWorkoutClick}
                className="mt-6 rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
              >
                + Ajouter ma première séance
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <p className="text-5xl">🔎</p>

              <h2 className="mt-4 text-2xl font-black">
                Aucun entraînement trouvé.
              </h2>

              <p className="mt-2 text-slate-400">
                Essaie de modifier ta recherche ou ton filtre.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-slate-200 transition hover:bg-white/10"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}