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
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <button
          type="button"
          onClick={onCancel}
          className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
        >
          ← Retour
        </button>

        <header className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
            Nouvelle séance
          </p>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Ajoute les détails de ta séance.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Complète les informations importantes : durée, ressenti, exercices,
            séries, répétitions et progression.
          </p>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
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