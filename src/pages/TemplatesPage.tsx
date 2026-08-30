import { useState } from 'react'

import WorkoutForm from '../components/WorkoutForm'
import Button from '../components/ui/Button'
import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { WorkoutFormValues } from '../types/workout'
import type { WorkoutTemplate } from '../types/workoutTemplate'

type TemplatesPageProps = {
  templates: WorkoutTemplate[]
  onBack: () => void
  onCreateWorkoutClick: () => void
  onStartFromTemplate: (template: WorkoutTemplate) => void
  onSaveTemplate: (name: string, values: WorkoutFormValues) => void
  onDeleteTemplate: (templateId: string) => void
}

export default function TemplatesPage({
  templates,
  onBack,
  onCreateWorkoutClick,
  onStartFromTemplate,
  onSaveTemplate,
  onDeleteTemplate,
}: TemplatesPageProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = (values: WorkoutFormValues) => {
    onSaveTemplate(values.title || 'Modèle sans nom', values)
    setIsCreating(false)
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-slate-50">
      <section className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Button
          variant="secondary"
          size="lg"
          onClick={onBack}
          className="mb-6"
        >
          ← Retour au dashboard
        </Button>

        <header className="relative overflow-hidden rounded-[2rem] border border-azur-400/15 bg-gradient-to-br from-azur-400/10 via-white/[0.04] to-sky-400/10 p-5 shadow-2xl shadow-black/25 sm:p-7 lg:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-azur-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-azur-300">
                Programmes & modèles
              </p>

              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Tes séances toutes prêtes.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Crée des modèles réutilisables (PUSH, PULL, footing…) et démarre
                une séance en un clic, déjà pré-remplie. Tu peux aussi
                enregistrer n’importe quelle séance comme modèle depuis son
                détail.
              </p>
            </div>

            {!isCreating ? (
              <Button
                size="lg"
                onClick={() => setIsCreating(true)}
                className="shrink-0"
              >
                + Créer un modèle
              </Button>
            ) : null}
          </div>
        </header>

        {isCreating ? (
          <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-azur-300">
                Nouveau modèle
              </p>

              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Décris le modèle.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Le titre servira de nom au modèle. La date n’a pas d’importance :
                elle sera fixée au jour où tu démarreras la séance.
              </p>
            </div>

            <WorkoutForm
              submitLabel="Enregistrer le modèle"
              onSubmit={handleSubmit}
              onCancel={() => setIsCreating(false)}
            />
          </section>
        ) : templates.length === 0 ? (
          <section className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-slate-950/40 p-10 text-center">
            <p className="text-5xl">📋</p>

            <h2 className="mt-4 text-2xl font-black text-white">
              Aucun modèle pour l’instant.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Crée ton premier modèle de séance pour gagner du temps à chaque
              entraînement.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => setIsCreating(true)}>
                + Créer un modèle
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={onCreateWorkoutClick}
              >
                Ajouter une séance
              </Button>
            </div>
          </section>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onStart={() => onStartFromTemplate(template)}
                onDelete={() => onDeleteTemplate(template.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function TemplateCard({
  template,
  onStart,
  onDelete,
}: {
  template: WorkoutTemplate
  onStart: () => void
  onDelete: () => void
}) {
  const category = SPORT_CATEGORIES.find((item) => item.id === template.category)
  const payload = template.payload
  const exercises = payload.details?.strengthExercises ?? []

  const meta: string[] = []
  meta.push(`${payload.duration} min`)
  meta.push(`Intensité ${payload.intensity}`)

  if (exercises.length > 0) {
    meta.push(`${exercises.length} exercice${exercises.length > 1 ? 's' : ''}`)
  }

  if (payload.details?.distance) {
    meta.push(`${payload.details.distance} km`)
  }

  const handleDelete = () => {
    if (window.confirm(`Supprimer le modèle « ${template.name} » ?`)) {
      onDelete()
    }
  }

  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-azur-400/25 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-azur-300">
            {category?.label ?? 'Autre'}
          </p>

          <h3 className="mt-2 line-clamp-2 break-words text-xl font-black leading-tight text-white">
            {template.name}
          </h3>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
          {category?.emoji ?? '✨'}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {meta.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-slate-100"
          >
            {item}
          </span>
        ))}
      </div>

      {exercises.length > 0 ? (
        <ul className="mt-4 space-y-1.5">
          {exercises.slice(0, 4).map((exercise, index) => (
            <li
              key={`${exercise.id}-${index}`}
              className="flex items-center justify-between gap-3 text-sm text-slate-300"
            >
              <span className="truncate font-bold">
                {exercise.name || 'Exercice'}
              </span>
              <span className="shrink-0 text-slate-500">
                {[exercise.sets, exercise.reps].filter(Boolean).join(' × ')}
              </span>
            </li>
          ))}
          {exercises.length > 4 ? (
            <li className="text-xs font-bold text-slate-500">
              + {exercises.length - 4} autre
              {exercises.length - 4 > 1 ? 's' : ''}…
            </li>
          ) : null}
        </ul>
      ) : payload.notes ? (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
          {payload.notes}
        </p>
      ) : null}

      <div className="mt-auto flex items-center gap-2 pt-5">
        <Button onClick={onStart} className="flex-1">
          ▶ Démarrer une séance
        </Button>

        <button
          type="button"
          onClick={handleDelete}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10 text-sm font-black text-red-300 transition hover:bg-red-400/20"
          aria-label="Supprimer le modèle"
          title="Supprimer"
        >
          ✕
        </button>
      </div>
    </article>
  )
}
