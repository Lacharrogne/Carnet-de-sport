import { Link } from 'react-router-dom'

import Button from '../components/ui/Button'

type ToolCard = {
  to: string
  label: string
  description: string
  icon: string
}

const TOOLS: ToolCard[] = [
  {
    to: '/planning',
    label: 'Planning',
    description:
      'Prépare tes prochaines séances et anticipe ta semaine d’entraînement.',
    icon: '📅',
  },
  {
    to: '/templates',
    label: 'Modèles',
    description:
      'Des séances toutes prêtes (PUSH, PULL, footing…) à démarrer en un clic.',
    icon: '📋',
  },
  {
    to: '/progress',
    label: 'Progression',
    description: 'Ton niveau, ton XP, tes records et tes badges au même endroit.',
    icon: '📊',
  },
  {
    to: '/body',
    label: 'Profil physique',
    description: 'Ton poids, tes mensurations et tes informations santé.',
    icon: '🧍',
  },
  {
    to: '/challenges',
    label: 'Défis',
    description: 'Des objectifs à compléter et des badges pour rester motivé.',
    icon: '🎯',
  },
  {
    to: '/profile',
    label: 'Mon profil',
    description: 'Ta photo, ton pseudo, ton identité sportive et l’export de tes données.',
    icon: '🙂',
  },
]

type ToolsPageProps = {
  onBack: () => void
}

export default function ToolsPage({ onBack }: ToolsPageProps) {
  return (
    <main className="min-h-screen overflow-x-hidden text-slate-50">
      <section className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Button variant="secondary" size="lg" onClick={onBack} className="mb-6">
          ← Retour au dashboard
        </Button>

        {/* Hero */}
        <header className="relative overflow-hidden rounded-[2rem] border border-azur-400/15 bg-gradient-to-br from-azur-400/10 via-white/[0.04] to-sky-400/10 p-5 shadow-2xl shadow-black/25 sm:p-7 lg:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-azur-400/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-azur-300">
              Outils du carnet
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Tous tes outils pour progresser.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Retrouve ici tout ce qui t’aide à t’entraîner : préparer tes
              séances, suivre ta progression, ton corps et tes objectifs.
            </p>
          </div>
        </header>

        {/* Cartes */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group flex flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
                {tool.icon}
              </span>

              <h2 className="mt-4 text-2xl font-black text-white">
                {tool.label}
              </h2>

              <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                {tool.description}
              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-azur-300">
                Ouvrir
                <span
                  aria-hidden="true"
                  className="transition group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
