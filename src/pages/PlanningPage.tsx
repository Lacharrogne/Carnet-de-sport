import { useMemo, useState, type FormEvent } from 'react'

import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { SportCategoryId } from '../types/workout'

type PlanningPageProps = {
  plannedWorkouts: PlannedWorkout[]
  onAddPlannedWorkout: (plannedWorkout: PlannedWorkout) => void | Promise<void>
  onDeletePlannedWorkout: (plannedWorkoutId: string) => void | Promise<void>
  onCompletePlannedWorkout: (plannedWorkout: PlannedWorkout) => void | Promise<void>
}

export default function PlanningPage({
  plannedWorkouts,
  onAddPlannedWorkout,
  onDeletePlannedWorkout,
  onCompletePlannedWorkout,
}: PlanningPageProps) {
  const today = new Date().toISOString().split('T')[0]

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<SportCategoryId>('musculation')
  const [date, setDate] = useState(today)
  const [duration, setDuration] = useState('')
  const [objective, setObjective] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sortedPlannedWorkouts = useMemo(() => {
    return [...plannedWorkouts].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }, [plannedWorkouts])

  const nextWorkout = useMemo(() => {
    return sortedPlannedWorkouts.find((plannedWorkout) => {
      return plannedWorkout.date >= today
    })
  }, [sortedPlannedWorkouts, today])

  const upcomingWorkoutsCount = useMemo(() => {
    return plannedWorkouts.filter((plannedWorkout) => {
      return plannedWorkout.date >= today
    }).length
  }, [plannedWorkouts, today])

  const overdueWorkoutsCount = useMemo(() => {
    return plannedWorkouts.filter((plannedWorkout) => {
      return plannedWorkout.date < today
    }).length
  }, [plannedWorkouts, today])

  const totalPlannedDuration = useMemo(() => {
    return plannedWorkouts.reduce((total, plannedWorkout) => {
      return total + plannedWorkout.duration
    }, 0)
  }, [plannedWorkouts])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const cleanedTitle = title.trim()
    const cleanedDuration = Number(duration)
    const cleanedObjective = objective.trim()

    if (!cleanedTitle) {
      window.alert('Donne un nom à ta séance prévue.')
      return
    }

    if (!date) {
      window.alert('Choisis une date pour ta séance prévue.')
      return
    }

    if (!duration || Number.isNaN(cleanedDuration) || cleanedDuration <= 0) {
      window.alert('Ajoute une durée valide.')
      return
    }

    const newPlannedWorkout: PlannedWorkout = {
      id: crypto.randomUUID(),
      title: cleanedTitle,
      category,
      date,
      duration: cleanedDuration,
      objective: cleanedObjective,
    }

    setIsSubmitting(true)

    try {
      await onAddPlannedWorkout(newPlannedWorkout)

      setTitle('')
      setCategory('musculation')
      setDate(today)
      setDuration('')
      setObjective('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Planning
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                Prépare tes prochaines séances.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Planifie tes entraînements à l’avance pour transformer ton sport
                en routine claire et motivante.
              </p>
            </div>

            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Prochaine séance
              </p>

              {nextWorkout ? (
                <>
                  <p className="mt-4 text-3xl font-black text-white">
                    {nextWorkout.title}
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    {formatDate(nextWorkout.date)} · {nextWorkout.duration} min
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-3xl font-black text-white">
                    Rien de prévu
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    Ajoute une séance pour garder le rythme.
                  </p>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard
            label="Séances prévues"
            value={plannedWorkouts.length.toString()}
          />

          <StatCard
            label="À venir"
            value={upcomingWorkoutsCount.toString()}
          />

          <StatCard
            label="À rattraper"
            value={overdueWorkoutsCount.toString()}
          />

          <StatCard
            label="Temps prévu"
            value={`${totalPlannedDuration} min`}
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
          >
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Nouvelle séance prévue
            </p>

            <div className="mt-6 space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-200">
                  Nom de la séance
                </span>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex : Séance jambes, footing, natation..."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-200">
                  Sport
                </span>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as SportCategoryId)
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

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">
                    Date
                  </span>

                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-200">
                    Durée prévue
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
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-200">
                  Objectif de la séance
                </span>

                <textarea
                  value={objective}
                  onChange={(event) => setObjective(event.target.value)}
                  rows={4}
                  placeholder="Ex : Travailler les jambes, courir sans m’arrêter, améliorer mon cardio..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Ajout en cours...' : '+ Ajouter au planning'}
              </button>
            </div>
          </form>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                  Séances à venir
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Ton programme.
                </h2>
              </div>

              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
                <p className="text-sm text-emerald-300">Total prévu</p>

                <p className="mt-1 text-2xl font-black text-white">
                  {plannedWorkouts.length}
                </p>
              </div>
            </div>

            {sortedPlannedWorkouts.length > 0 ? (
              <div className="mt-6 space-y-4">
                {sortedPlannedWorkouts.map((plannedWorkout) => (
                  <PlannedWorkoutCard
                    key={plannedWorkout.id}
                    plannedWorkout={plannedWorkout}
                    isOverdue={plannedWorkout.date < today}
                    onDelete={() =>
                      onDeletePlannedWorkout(plannedWorkout.id)
                    }
                    onComplete={() =>
                      onCompletePlannedWorkout(plannedWorkout)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-8 text-center">
                <p className="text-5xl">📅</p>

                <h3 className="mt-4 text-2xl font-black text-white">
                  Aucune séance prévue.
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Planifie une séance pour garder une direction claire.
                </p>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

function PlannedWorkoutCard({
  plannedWorkout,
  isOverdue,
  onDelete,
  onComplete,
}: {
  plannedWorkout: PlannedWorkout
  isOverdue: boolean
  onDelete: () => void | Promise<void>
  onComplete: () => void | Promise<void>
}) {
  const sportCategory = SPORT_CATEGORIES.find((category) => {
    return category.id === plannedWorkout.category
  })

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-400">
              {formatDate(plannedWorkout.date)}
            </p>

            {isOverdue ? (
              <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-black text-red-200">
                À rattraper
              </span>
            ) : (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200">
                À venir
              </span>
            )}
          </div>

          <h3 className="mt-2 text-2xl font-black text-white">
            {plannedWorkout.title}
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {sportCategory?.emoji ?? '🏃'} {sportCategory?.label ?? 'Sport'}
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {plannedWorkout.duration} min
            </span>
          </div>

          {plannedWorkout.objective ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Objectif
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {plannedWorkout.objective}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex gap-2 sm:flex-col">
          <button
            type="button"
            onClick={() => {
              void onComplete()
            }}
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
          >
            Marquer réalisée
          </button>

          <button
            type="button"
            onClick={() => {
              void onDelete()
            }}
            className="rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-black text-red-200 transition hover:bg-red-400/20"
          >
            Supprimer
          </button>
        </div>
      </div>
    </article>
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}