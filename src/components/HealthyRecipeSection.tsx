import { ECOSYSTEM_LINKS } from '../data/ecosystemLinks'
import type { HealthProfile } from '../types/health'

type HealthyRecipeSectionProps = {
  profile: HealthProfile
}

const goalRecipeAdvice: Record<HealthProfile['goal'], string> = {
  'perte-de-poids':
    'Privilégie les recettes rassasiantes, riches en protéines et avec des légumes pour tenir sans frustration.',
  'prise-de-muscle':
    'Cherche des repas riches en protéines, avec des glucides utiles pour l’énergie et la récupération.',
  endurance:
    'Mise sur des recettes avec de bons glucides, une digestion simple et assez d’énergie pour tenir l’effort.',
  'bien-etre':
    'Choisis des recettes simples, équilibrées et faciles à refaire dans la semaine.',
  performance:
    'Oriente-toi vers des repas complets : protéines, glucides, bons lipides et bonne hydratation.',
}

const goalLabels: Record<HealthProfile['goal'], string> = {
  'perte-de-poids': 'Perte de poids',
  'prise-de-muscle': 'Prise de muscle',
  endurance: 'Endurance',
  'bien-etre': 'Bien-être',
  performance: 'Performance',
}

export default function HealthyRecipeSection({
  profile,
}: HealthyRecipeSectionProps) {
  const recipeApp = ECOSYSTEM_LINKS.recipes

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-600">
            {recipeApp.emoji} Nutrition
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Relie ton sport à ton alimentation.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Ton objectif actuel est{' '}
            <span className="font-bold text-amber-600">
              {goalLabels[profile.goal]}
            </span>
            . Utilise {recipeApp.name} pour trouver des idées de repas plus
            cohérentes avec ta progression.
          </p>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
              Conseil rapide
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {goalRecipeAdvice[profile.goal]}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={recipeApp.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
            >
              <span>{recipeApp.emoji}</span>
              <span>Ouvrir {recipeApp.name}</span>
            </a>

            <a
              href={`${recipeApp.url}/recipes?tag=healthy`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
            >
              Voir des idées healthy
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-amber-600">
            Écosystème
          </p>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 text-3xl">
              {recipeApp.emoji}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {recipeApp.name}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {recipeApp.description}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <EcosystemPoint
              icon="🥗"
              title="Manger plus équilibré"
              text="Utiliser les recettes pour mieux accompagner tes séances."
            />

            <EcosystemPoint
              icon="🧊"
              title="Mode frigo"
              text="Trouver quoi cuisiner avec ce que tu as déjà."
            />

            <EcosystemPoint
              icon="📋"
              title="Liste de courses"
              text="Préparer tes repas sans perdre de temps."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function EcosystemPoint({
  icon,
  title,
  text,
}: {
  icon: string
  title: string
  text: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl">
          {icon}
        </div>

        <div>
          <p className="font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  )
}