import { ECOSYSTEM_LINKS } from '../config/ecosystemLinks'
import { HEALTHY_RECIPE_SUGGESTIONS } from '../data/healthyRecipeSuggestions'
import type { HealthProfile } from '../types/health'

type HealthyRecipeSectionProps = {
  profile: HealthProfile
}

export default function HealthyRecipeSection({
  profile,
}: HealthyRecipeSectionProps) {
  const mainSuggestion =
    HEALTHY_RECIPE_SUGGESTIONS.find((suggestion) => {
      return suggestion.goal === profile.goal
    }) ?? HEALTHY_RECIPE_SUGGESTIONS[0]

  const otherSuggestions = HEALTHY_RECIPE_SUGGESTIONS.filter((suggestion) => {
    return suggestion.id !== mainSuggestion.id
  }).slice(0, 3)

  const recipeSearchUrl = `${ECOSYSTEM_LINKS.recipes}?tag=${mainSuggestion.tag}`

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
            Carnet de recettes
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            Manger mieux pour mieux progresser.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Ton activité sportive peut être reliée à des idées de recettes healthy, adaptées à ton objectif actuel.
          </p>
        </div>

        <a
          href={ECOSYSTEM_LINKS.recipes}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-emerald-400 px-6 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-emerald-300"
        >
          Ouvrir Carnet de recettes
        </a>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
          <p className="text-4xl">{mainSuggestion.emoji}</p>

          <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
            Recommandé pour ton objectif
          </p>

          <h3 className="mt-2 text-2xl font-black text-white">
            {mainSuggestion.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {mainSuggestion.description}
          </p>

          <a
            href={recipeSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/20"
          >
            Voir les recettes liées
          </a>
        </article>

        <div className="grid gap-4">
          {otherSuggestions.map((suggestion) => (
            <article
              key={suggestion.id}
              className="rounded-3xl border border-white/10 bg-slate-950/60 p-5"
            >
              <div className="flex items-start gap-4">
                <p className="text-3xl">{suggestion.emoji}</p>

                <div>
                  <h3 className="font-black text-white">
                    {suggestion.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}