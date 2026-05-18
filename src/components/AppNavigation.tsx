import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

import { ECOSYSTEM_LINKS } from '../data/ecosystemLinks'

type AppNavigationProps = {
  user: User | null
  isAuthLoading: boolean
  onSignOut: () => Promise<void>
}

type NavItem = {
  label: string
  path: string
  icon: string
  end?: boolean
}

const suiviItems: NavItem[] = [
  { label: 'Progression', path: '/progress', icon: '📈' },
  { label: 'Défis', path: '/challenges', icon: '🎯' },
]

const carnetItems: NavItem[] = [
  { label: 'Planning', path: '/planning', icon: '🗓️' },
  { label: 'Séances', path: '/workouts', icon: '🏋️' },
]

function isPathActive(pathname: string, path: string) {
  if (path === '/') {
    return pathname === '/'
  }

  return pathname === path || pathname.startsWith(`${path}/`)
}

function pillClass(isActive: boolean) {
  return [
    'flex min-w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-black transition',
    isActive
      ? 'border-emerald-400 bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20'
      : 'border-white/10 bg-white/[0.06] text-white hover:border-emerald-400/40 hover:bg-white/[0.1]',
  ].join(' ')
}

function DesktopDropdown({
  label,
  icon,
  items,
}: {
  label: string
  icon: string
  items: NavItem[]
}) {
  const location = useLocation()
  const isActive = items.some((item) =>
    isPathActive(location.pathname, item.path),
  )

  return (
    <div className="group relative">
      <button type="button" className={pillClass(isActive)}>
        <span>{icon}</span>
        <span>{label}</span>
        <span className="text-[10px] opacity-70">▾</span>
      </button>

      <div className="pointer-events-none absolute left-1/2 top-full z-50 w-[360px] -translate-x-1/2 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="rounded-[1.5rem] border border-white/10 bg-[#10131f] p-4 shadow-2xl shadow-black/40">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
            {label}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'rounded-2xl border p-4 transition',
                    isActive
                      ? 'border-emerald-400/60 bg-emerald-400/15'
                      : 'border-white/10 bg-white/[0.04] hover:border-emerald-400/40 hover:bg-white/[0.08]',
                  ].join(' ')
                }
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-xl">
                  {item.icon}
                </div>

                <p className="text-base font-black text-white">
                  {item.label}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Ouvrir la page
                </p>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileNavLink({
  item,
  onClick,
}: {
  item: NavItem
  onClick: () => void
}) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center justify-between rounded-2xl border px-4 py-4 text-base font-black transition',
          isActive
            ? 'border-emerald-400 bg-emerald-400 text-slate-950'
            : 'border-white/10 bg-white/[0.04] text-white',
        ].join(' ')
      }
    >
      <span className="flex items-center gap-3">
        <span>{item.icon}</span>
        <span>{item.label}</span>
      </span>

      <span>→</span>
    </NavLink>
  )
}

export default function AppNavigation({
  user,
  isAuthLoading,
  onSignOut,
}: AppNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const userEmail = user?.email ?? ''
  const recipeApp = ECOSYSTEM_LINKS.recipes

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current)
  }

  const handleSignOut = () => {
    closeMenu()
    void onSignOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070a16]/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-2xl">
            ⚡
          </div>

          <div className="min-w-0">
            <p className="truncate text-xl font-black leading-tight text-white">
              Carnet de sport
            </p>

            <p className="truncate text-xs font-semibold text-slate-400">
              Sport · santé · progression
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 2xl:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) => pillClass(isActive)}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/body"
            className={({ isActive }) => pillClass(isActive)}
          >
            <span>🧬</span>
            <span>Mon corps</span>
          </NavLink>

          <DesktopDropdown label="Suivi" icon="📊" items={suiviItems} />
          <DesktopDropdown label="Carnet" icon="📒" items={carnetItems} />

          <NavLink
            to="/workouts/new"
            className={({ isActive }) =>
              [
                'flex min-w-fit items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-black transition hover:scale-105',
                isActive
                  ? 'border-emerald-300 bg-emerald-300 text-slate-950'
                  : 'border-emerald-400 bg-emerald-400 text-slate-950',
              ].join(' ')
            }
          >
            <span>+</span>
            <span>Ajouter</span>
          </NavLink>

          <a
            href={recipeApp.url}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-fit items-center gap-2 rounded-full border border-orange-300/25 bg-orange-400/10 px-5 py-2.5 text-sm font-black text-orange-100 transition hover:bg-orange-400/20"
          >
            <span>{recipeApp.emoji}</span>
            <span>{recipeApp.shortName}</span>
          </a>
        </nav>

        <div className="hidden min-w-fit items-center gap-2 2xl:flex">
          {isAuthLoading ? (
            <div className="rounded-full border border-sky-400/30 bg-sky-400/10 px-5 py-2.5 text-sm font-black text-sky-100">
              Chargement...
            </div>
          ) : user ? (
            <div className="flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-2">
              <span className="max-w-[150px] truncate text-xs font-bold text-sky-100">
                {userEmail}
              </span>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full bg-sky-300 px-4 py-2 text-xs font-black text-slate-950 transition hover:scale-105"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded-full border border-sky-400/40 bg-sky-400/10 px-5 py-2.5 text-sm font-black text-sky-100 transition hover:bg-sky-400/20"
            >
              Connexion
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-2xl font-black text-white 2xl:hidden"
          aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {isMenuOpen ? '×' : '☰'}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-[#070a16] px-4 py-5 sm:px-6 2xl:hidden">
          <div className="mx-auto flex max-w-[900px] flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <MobileNavLink
                item={{ label: 'Dashboard', path: '/', icon: '🏠', end: true }}
                onClick={closeMenu}
              />

              <MobileNavLink
                item={{ label: 'Mon corps', path: '/body', icon: '🧬' }}
                onClick={closeMenu}
              />

              <MobileNavLink
                item={{ label: 'Progression', path: '/progress', icon: '📈' }}
                onClick={closeMenu}
              />

              <MobileNavLink
                item={{ label: 'Planning', path: '/planning', icon: '🗓️' }}
                onClick={closeMenu}
              />

              <MobileNavLink
                item={{ label: 'Défis', path: '/challenges', icon: '🎯' }}
                onClick={closeMenu}
              />

              <MobileNavLink
                item={{ label: 'Séances', path: '/workouts', icon: '🏋️' }}
                onClick={closeMenu}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <NavLink
                to="/workouts/new"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400 bg-emerald-400 px-6 py-4 text-base font-black text-slate-950"
              >
                <span>+</span>
                <span>Ajouter une séance</span>
              </NavLink>

              <a
                href={recipeApp.url}
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-2xl border border-orange-300/25 bg-orange-400/10 px-6 py-4 text-base font-black text-orange-100"
              >
                <span>{recipeApp.emoji}</span>
                <span>{recipeApp.shortName}</span>
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              {isAuthLoading ? (
                <p className="font-black text-sky-100">
                  Chargement...
                </p>
              ) : user ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="truncate font-bold text-sky-100">
                    {userEmail}
                  </p>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-full bg-sky-300 px-5 py-3 font-black text-slate-950"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-full border border-sky-400/40 bg-sky-400/10 px-6 py-4 font-black text-sky-100"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}