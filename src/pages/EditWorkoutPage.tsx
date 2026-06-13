import WorkoutForm from '../components/WorkoutForm'
import type { Workout, WorkoutFormValues } from '../types/workout'

type EditWorkoutPageProps = {
  workout: Workout
  onSubmit: (values: WorkoutFormValues) => void | Promise<void>
  onCancel: () => void
}

export default function EditWorkoutPage({
  workout,
  onSubmit,
  onCancel,
}: EditWorkoutPageProps) {
  const initialValues: WorkoutFormValues = {
    title: workout.title,
    category: workout.category,
    date: workout.date,
    duration: workout.duration,
    intensity: workout.intensity,
    feeling: workout.feeling,
    notes: workout.notes,
    improvementIdea: workout.improvementIdea,
    trend: workout.trend,
    details: workout.details,
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <button
          type="button"
          onClick={onCancel}
          className="mb-6 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          ← Retour aux entraînements
        </button>

        <header className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
            Modifier une séance
          </p>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Corrige ton entraînement.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Mets à jour la durée, le ressenti, les notes ou l’idée
            d’amélioration.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <WorkoutForm
            initialValues={initialValues}
            submitLabel="Modifier la séance"
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </section>
      </section>
    </main>
  )
}