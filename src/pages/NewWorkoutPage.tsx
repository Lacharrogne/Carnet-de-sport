import WorkoutForm from '../components/WorkoutForm'
import type { WorkoutFormValues } from '../types/workout'

type NewWorkoutPageProps = {
  initialValues?: WorkoutFormValues
  submitLabel?: string
  onSubmit: (values: WorkoutFormValues) => void
  onCancel: () => void
}

export default function NewWorkoutPage({
  initialValues,
  submitLabel = 'Enregistrer la séance',
  onSubmit,
  onCancel,
}: NewWorkoutPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <button
          type="button"
          onClick={onCancel}
          className="mb-6 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          ← Retour
        </button>

        <header className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600">
            Nouvelle séance
          </p>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Ajoute les détails de ta séance.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Complète les informations importantes : durée, ressenti, exercices,
            séries, répétitions et progression.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <WorkoutForm
            initialValues={initialValues}
            submitLabel={submitLabel}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </section>
      </section>
    </main>
  )
}