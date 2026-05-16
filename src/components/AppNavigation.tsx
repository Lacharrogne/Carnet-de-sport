import type { User } from '@supabase/supabase-js'
import { Link, useLocation } from 'react-router-dom'

import { ECOSYSTEM_LINKS } from '../config/ecosystemLinks'

type AppNavigationProps = {
  user: User | null
  isAuthLoading: boolean
  onSignOut: () => void
}

const navigationItems = [
  {
    to: '/',
    label: 'Dashboard',
    emoji: '🏠',
    id: 'dashboard',
  },
  {
    to: '/body',
    label: 'Mon corps',
    emoji: '🧬',
    id: 'body',
  },
  {
    to: '/progress',
    label: 'Progression',
    emoji: '📈',
    id: 'progress',
  },
  {
    to: '/planning',
    label: 'Planning',
    emoji: '📅',
    id: 'planning',
  },
  {
    to: '/challenges',
    label: 'Défis',
    emoji: '🎯',
    id: 'challenges',
  },
  {
    to: '/workouts',
    label: 'Séances',
    emoji: '🏋️',
    id: 'workouts',
  },
] as const

export default function AppNavigation({
  user,
  isAuthLoading,
  onSignOut,
}: AppNavigationProps) {
  const location = useLocation()

  const isActive = (id: string) => {
    if (id === 'dashboard') {
      return location.pathname === '/'
    }

    if (id === 'body') {
      return location.pathname.startsWith('/body')
    }

    if (id === 'progress') {
      return location.pathname.startsWith('/progress')
    }

    if (id === 'planning') {
      return location.pathname.startsWith('/planning')
    }

    if (id === 'challenges') {
      return location.pathname.startsWith('/challenges')
    }

    if (id === 'workouts') {
      return (
        location.pathname === '/workouts' ||
        location.pathname.includes('/edit')
      )
    }

    return false
  }

  const isNewWorkoutActive = location.pathname === '/workouts/new'

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 px-6 py-4 text-slate-50 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <Link to="/" className="flex items-center gap-3 text-left">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-2xl">
            ⚡
          </span>

          <div>
            <p className="text-lg font-black text-white">
              Carnet de sport
            </p>
            <p className="text-xs text-slate-400">
              Sport · santé · progression
            </p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {navigationItems.map((item) => {
            const active = isActive(item.id)

            return (
              <Link
                key={item.id}
                to={item.to}
                className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                  active
                    ? 'border-emerald-400/30 bg-emerald-400 text-slate-950'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{item.emoji}</span>
                {item.label}
              </Link>
            )
          })}

          <Link
            to="/workouts/new"
            className={`rounded-full px-4 py-2 text-sm font-black transition ${
              isNewWorkoutActive
                ? 'bg-emerald-300 text-slate-950'
                : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
            }`}
          >
            + Ajouter
          </Link>

          <a
            href={ECOSYSTEM_LINKS.recipes}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-orange-300/20 bg-orange-300/10 px-4 py-2 text-sm font-black text-orange-200 transition hover:bg-orange-300/20"
          >
            🍲 Recettes
          </a>

          {isAuthLoading ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-400">
              Connexion...
            </span>
          ) : user ? (
            <div className="flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 p-1">
              <span className="max-w-44 truncate px-3 text-sm font-bold text-sky-200">
                {user.email}
              </span>

              <button
                type="button"
                onClick={onSignOut}
                className="rounded-full bg-sky-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-sky-200"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-black text-sky-200 transition hover:bg-sky-400/20"
            >
              Connexion
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}