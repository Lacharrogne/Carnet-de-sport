import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

type AppNavigationProps = {
  user: User | null
  isAuthLoading: boolean
  onSignOut: () => void | Promise<void>
}

type UserMetadata = {
  display_name?: string
  full_name?: string
  name?: string
  avatar_url?: string
  picture?: string
}

type MobileSection = 'tools' | 'profile' | null

const toolsLinks = [
  {
    to: '/planning',
    label: 'Planning',
    description: 'Préparer tes prochaines séances',
    icon: '📅',
  },
  {
    to: '/progress',
    label: 'Progression',
    description: 'Voir ton niveau, ton XP et tes badges',
    icon: '📊',
  },
]

const profileLinks = [
  {
    to: '/profile',
    label: 'Mon profil',
    description: 'Photo, pseudo et identité sportive',
    icon: '🙂',
  },
  {
    to: '/body',
    label: 'Profil physique',
    description: 'Corps, santé et informations sportives',
    icon: '🧍',
  },
  {
    to: '/challenges',
    label: 'Défis',
    description: 'Objectifs, badges et motivation',
    icon: '🎯',
  },
]

export default function AppNavigation({
  user,
  isAuthLoading,
  onSignOut,
}: AppNavigationProps) {
  const location = useLocation()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openMobileSection, setOpenMobileSection] =
    useState<MobileSection>(null)
  const [openDesktopMenu, setOpenDesktopMenu] = useState<MobileSection>(null)

  const isToolsActive =
    location.pathname === '/planning' || location.pathname === '/progress'

  const isProfileActive =
    location.pathname === '/profile' ||
    location.pathname === '/body' ||
    location.pathname === '/challenges'

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false)
    setOpenMobileSection(null)
    setOpenDesktopMenu(null)
  }

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      setOpenMobileSection(null)
    }

    setIsMobileMenuOpen((currentValue) => !currentValue)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 text-slate-50 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={closeAllMenus}
            className="group flex min-w-0 items-center gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 to-sky-400/10 text-2xl shadow-lg shadow-emerald-400/5 transition group-hover:scale-105">
              ⚡
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-black leading-tight text-white">
                Carnet de sport
              </p>

              <p className="truncate text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Suivi sportif & motivation
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 shadow-xl shadow-black/20 lg:flex">
            <DesktopNavLink
              to="/"
              label="Accueil"
              end
              onClick={closeAllMenus}
            />

            <DesktopNavLink
              to="/workouts"
              label="Séances"
              onClick={closeAllMenus}
            />

            <DesktopDropdown
              label="Outils"
              title="Outils du carnet"
              subtitle="Planning, progression et suivi"
              links={toolsLinks}
              isActive={isToolsActive}
              isOpen={openDesktopMenu === 'tools'}
              onOpen={() => setOpenDesktopMenu('tools')}
              onClose={() => setOpenDesktopMenu(null)}
              onItemClick={closeAllMenus}
            />
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/workouts/new"
              onClick={closeAllMenus}
              className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-emerald-400/10 transition hover:bg-emerald-300"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-emerald-300">
                +
              </span>
              Ajouter une séance
            </Link>

            <DesktopProfileDropdown
              user={user}
              isAuthLoading={isAuthLoading}
              isActive={isProfileActive}
              isOpen={openDesktopMenu === 'profile'}
              onOpen={() => setOpenDesktopMenu('profile')}
              onClose={() => setOpenDesktopMenu(null)}
              onItemClick={closeAllMenus}
              onSignOut={onSignOut}
            />
          </div>

          <button
            type="button"
            onClick={toggleMobileMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-xl transition hover:bg-white/[0.1] lg:hidden"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </nav>
      </header>

      {isMobileMenuOpen ? (
        <MobileMenu
          user={user}
          isAuthLoading={isAuthLoading}
          openSection={openMobileSection}
          onOpenSection={setOpenMobileSection}
          onClose={closeAllMenus}
          onSignOut={onSignOut}
        />
      ) : null}
    </>
  )
}

function DesktopNavLink({
  to,
  label,
  end,
  onClick,
}: {
  to: string
  label: string
  end?: boolean
  onClick: () => void
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'rounded-full px-5 py-3 text-sm font-black transition',
          isActive
            ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/10'
            : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

function DesktopDropdown({
  label,
  title,
  subtitle,
  links,
  isActive,
  isOpen,
  onOpen,
  onClose,
  onItemClick,
}: {
  label: string
  title: string
  subtitle: string
  links: typeof toolsLinks
  isActive: boolean
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onItemClick: () => void
}) {
  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        className={[
          'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition',
          isActive || isOpen
            ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/10'
            : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
        ].join(' ')}
      >
        {label}
        <span
          className={[
            'text-xs transition',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        >
          ⌄
        </span>
      </button>

      <div className="absolute left-0 top-full h-4 w-full" />

      <div
        className={[
          'absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-[420px] -translate-x-1/2 rounded-[2rem] border border-white/10 bg-[#07111f] p-5 shadow-2xl shadow-black/40 transition duration-150',
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-2 opacity-0',
        ].join(' ')}
      >
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
          {title}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-400">
          {subtitle}
        </p>

        <div className="mt-5 grid gap-3">
          {links.map((link) => (
            <DropdownItem
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              description={link.description}
              onClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DesktopProfileDropdown({
  user,
  isAuthLoading,
  isActive,
  isOpen,
  onOpen,
  onClose,
  onItemClick,
  onSignOut,
}: {
  user: User | null
  isAuthLoading: boolean
  isActive: boolean
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onItemClick: () => void
  onSignOut: () => void | Promise<void>
}) {
  if (isAuthLoading) {
    return (
      <div className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-slate-400">
        Connexion...
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        onClick={onItemClick}
        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-slate-100 transition hover:bg-white/[0.1]"
      >
        Se connecter
      </Link>
    )
  }

  const displayName = getUserDisplayName(user)
  const avatarUrl = getUserAvatarUrl(user)

  const handleSignOut = async () => {
    await onSignOut()
    onItemClick()
  }

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        className={[
          'inline-flex max-w-[270px] items-center gap-3 rounded-full border px-4 py-2.5 transition',
          isActive || isOpen
            ? 'border-emerald-400/30 bg-emerald-400/15'
            : 'border-white/10 bg-white/[0.05] hover:bg-white/[0.1]',
        ].join(' ')}
      >
        <Avatar avatarUrl={avatarUrl} displayName={displayName} />

        <span className="min-w-0 truncate text-sm font-black text-white">
          {displayName}
        </span>

        <span
          className={[
            'text-xs text-slate-400 transition',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        >
          ⌄
        </span>
      </button>

      <div className="absolute left-0 top-full h-4 w-full" />

      <div
        className={[
          'absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[430px] rounded-[2rem] border border-white/10 bg-[#07111f] p-5 shadow-2xl shadow-black/40 transition duration-150',
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-2 opacity-0',
        ].join(' ')}
      >
        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
          <div className="flex items-center gap-4">
            <Avatar avatarUrl={avatarUrl} displayName={displayName} large />

            <div className="min-w-0">
              <p className="truncate text-lg font-black text-white">
                {displayName}
              </p>

              <p className="truncate text-sm font-bold text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {profileLinks.map((link) => (
            <DropdownItem
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              description={link.description}
              onClick={onItemClick}
            />
          ))}

          <button
            type="button"
            onClick={() => {
              void handleSignOut()
            }}
            className="rounded-[1.5rem] border border-red-400/20 bg-red-400/10 p-4 text-left transition hover:bg-red-400/20"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/15 text-2xl">
                🚪
              </span>

              <div>
                <p className="font-black text-red-200">Déconnexion</p>

                <p className="mt-1 text-sm font-bold text-red-100/70">
                  Quitter ton compte
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function DropdownItem({
  to,
  icon,
  label,
  description,
  onClick,
}: {
  to: string
  icon: string
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-[1.5rem] border border-transparent p-4 transition hover:border-white/10 hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl">
          {icon}
        </span>

        <div>
          <p className="font-black text-white">{label}</p>

          <p className="mt-1 text-sm font-bold text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

function MobileMenu({
  user,
  isAuthLoading,
  openSection,
  onOpenSection,
  onClose,
  onSignOut,
}: {
  user: User | null
  isAuthLoading: boolean
  openSection: MobileSection
  onOpenSection: (section: MobileSection) => void
  onClose: () => void
  onSignOut: () => void | Promise<void>
}) {
  const displayName = getUserDisplayName(user)
  const avatarUrl = getUserAvatarUrl(user)

  const toggleSection = (section: MobileSection) => {
    onOpenSection(openSection === section ? null : section)
  }

  const handleSignOut = async () => {
    await onSignOut()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-screen w-full max-w-[430px] overflow-y-auto border-l border-white/10 bg-[#050816] px-5 py-5 text-slate-50 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 to-sky-400/10 text-2xl">
              ⚡
            </div>

            <div className="min-w-0">
              <p className="truncate text-xl font-black text-white">
                Carnet de sport
              </p>

              <p className="truncate text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                Suivi sportif
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-2xl text-slate-200"
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>

        <div className="mt-8 grid gap-3">
          <MobileBigLink
            to="/"
            icon="🏠"
            label="Accueil"
            onClick={onClose}
            end
          />

          <MobileBigLink
            to="/workouts/new"
            icon="+"
            label="Ajouter une séance"
            onClick={onClose}
            variant="primary"
          />

          <MobileBigLink
            to="/workouts"
            icon="📘"
            label="Séances"
            onClick={onClose}
          />

          <MobileAccordion
            icon="🧰"
            label="Outils"
            isOpen={openSection === 'tools'}
            onToggle={() => toggleSection('tools')}
          >
            {toolsLinks.map((link) => (
              <MobileSubLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                description={link.description}
                onClick={onClose}
              />
            ))}
          </MobileAccordion>

          {isAuthLoading ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 text-sm font-black text-slate-400">
              Connexion...
            </div>
          ) : !user ? (
            <MobileBigLink
              to="/auth"
              icon="🔐"
              label="Se connecter"
              onClick={onClose}
            />
          ) : (
            <MobileAccordion
              icon={
                <Avatar
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                  large
                />
              }
              label={displayName}
              isOpen={openSection === 'profile'}
              onToggle={() => toggleSection('profile')}
            >
              <div className="mb-3 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    avatarUrl={avatarUrl}
                    displayName={displayName}
                    large
                  />

                  <div className="min-w-0">
                    <p className="truncate font-black text-white">
                      {displayName}
                    </p>

                    <p className="truncate text-sm font-bold text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {profileLinks.map((link) => (
                <MobileSubLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  description={link.description}
                  onClick={onClose}
                />
              ))}

              <button
                type="button"
                onClick={() => {
                  void handleSignOut()
                }}
                className="mt-2 w-full rounded-[1.5rem] border border-red-400/20 bg-red-400/10 p-4 text-left transition hover:bg-red-400/20"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-400/15 text-xl">
                    🚪
                  </span>

                  <div>
                    <p className="font-black text-red-200">Déconnexion</p>
                    <p className="mt-1 text-sm font-bold text-red-100/70">
                      Quitter ton compte
                    </p>
                  </div>
                </div>
              </button>
            </MobileAccordion>
          )}
        </div>
      </aside>
    </div>
  )
}

function MobileBigLink({
  to,
  icon,
  label,
  onClick,
  end,
  variant = 'default',
}: {
  to: string
  icon: string
  label: string
  onClick: () => void
  end?: boolean
  variant?: 'default' | 'primary'
}) {
  if (variant === 'primary') {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center justify-between gap-4 rounded-[1.75rem] bg-emerald-400 p-5 text-slate-950 shadow-xl shadow-emerald-400/10 transition hover:bg-emerald-300"
      >
        <span className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-xl font-black text-emerald-300">
            {icon}
          </span>

          <span className="text-lg font-black">{label}</span>
        </span>

        <span className="text-xl">→</span>
      </Link>
    )
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center justify-between gap-4 rounded-[1.75rem] border p-5 transition',
          isActive
            ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
            : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]',
        ].join(' ')
      }
    >
      <span className="flex items-center gap-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-lg font-black">{label}</span>
      </span>

      <span className="text-xl text-slate-400">→</span>
    </NavLink>
  )
}

function MobileAccordion({
  icon,
  label,
  isOpen,
  onToggle,
  children,
}: {
  icon: string | React.ReactNode
  label: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 rounded-[1.25rem] px-1 py-1 text-left"
      >
        <span className="flex min-w-0 items-center gap-4">
          {typeof icon === 'string' ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            icon
          )}

          <span className="min-w-0 truncate text-lg font-black text-white">
            {label}
          </span>
        </span>

        <span
          className={[
            'text-sm text-slate-400 transition',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        >
          ⌄
        </span>
      </button>

      {isOpen ? (
        <div className="mt-4 grid gap-3">
          {children}
        </div>
      ) : null}
    </div>
  )
}

function MobileSubLink({
  to,
  icon,
  label,
  description,
  onClick,
}: {
  to: string
  icon: string
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4 transition hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-xl">
          {icon}
        </span>

        <div>
          <p className="font-black text-white">{label}</p>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

function Avatar({
  avatarUrl,
  displayName,
  large = false,
}: {
  avatarUrl: string
  displayName: string
  large?: boolean
}) {
  const [hasError, setHasError] = useState(false)
  const sizeClass = large ? 'h-14 w-14 text-xl' : 'h-10 w-10 text-base'

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        onError={() => setHasError(true)}
        className={`${sizeClass} shrink-0 rounded-full border border-white/10 object-cover`}
      />
    )
  }

  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/15 font-black text-emerald-200`}
    >
      {getInitials(displayName)}
    </span>
  )
}

function getUserMetadata(user: User | null): UserMetadata {
  return (user?.user_metadata ?? {}) as UserMetadata
}

function getUserDisplayName(user: User | null) {
  const metadata = getUserMetadata(user)

  return (
    metadata.display_name ||
    metadata.full_name ||
    metadata.name ||
    user?.email?.split('@')[0] ||
    'Sportif'
  )
}

function getUserAvatarUrl(user: User | null) {
  const metadata = getUserMetadata(user)

  return metadata.avatar_url || metadata.picture || ''
}

function getInitials(name: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return initials || 'S'
}