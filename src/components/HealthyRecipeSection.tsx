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
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-orange-300/20 bg-gradient-to-br from-orange-400/10 via-white/[0.04] to-emerald-400/10 p-6 shadow-2xl shadow-orange-400/10">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-orange-300/25 bg-orange-400/10 px-4 py-2 text-sm font-black text-orange-200">
            {recipeApp.emoji} Nutrition
          </p>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Relie ton sport à ton alimentation.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Ton objectif actuel est{' '}
            <span className="font-black text-orange-200">
              {goalLabels[profile.goal]}
            </span>
            . Utilise {recipeApp.name} pour trouver des idées de repas plus
            cohérentes avec ta progression.
          </p>

          <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">
              Conseil rapide
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              {goalRecipeAdvice[profile.goal]}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={recipeApp.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-orange-200"
            >
              <span>{recipeApp.emoji}</span>
              <span>Ouvrir {recipeApp.name}</span>
            </a>

            <a
              href={`${recipeApp.url}/recipes?tag=healthy`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-slate-100 transition hover:bg-white/10"
            >
              Voir des idées healthy
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-200">
            Écosystème
          </p>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-orange-300/25 bg-orange-400/10 text-3xl">
              {recipeApp.emoji}
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                {recipeApp.name}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-400">
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
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl">
          {icon}
        </div>

        <div>
          <p className="font-black text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
        </div>
      </div>
    </div>
  )
}