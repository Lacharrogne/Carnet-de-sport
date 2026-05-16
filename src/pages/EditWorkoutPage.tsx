import WorkoutForm from '../components/WorkoutForm'
import type { Workout, WorkoutFormValues } from '../types/workout'

type EditWorkoutPageProps = {
  workout: Workout
  onSubmit: (values: WorkoutFormValues) => void
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
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <button
          onClick={onCancel}
          className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
        >
          ← Retour aux entraînements
        </button>

        <header className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
            Modifier une séance
          </p>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Corrige ton entraînement.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Mets à jour la durée, le ressenti, les notes ou l’idée d’amélioration.
          </p>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8">
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