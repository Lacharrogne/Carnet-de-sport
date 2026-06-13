import { useState } from 'react'
import type { ComponentType } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import {
  CalendarDays,
  ChevronDown,
  Dumbbell,
  HeartPulse,
  Home,
  LogIn,
  LogOut,
  Menu,
  NotebookPen,
  Plus,
  Target,
  TrendingUp,
  UserRound,
  Wrench,
  X,
} from 'lucide-react'

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

type NavLinkItem = {
  to: string
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}

const toolsLinks: NavLinkItem[] = [
  {
    to: '/planning',
    label: 'Planning',
    description: 'Préparer tes prochaines séances',
    icon: CalendarDays,
  },
  {
    to: '/progress',
    label: 'Progression',
    description: 'Ton niveau, ton XP et tes badges',
    icon: TrendingUp,
  },
]

const profileLinks: NavLinkItem[] = [
  {
    to: '/profile',
    label: 'Mon profil',
    description: 'Photo, pseudo et identité sportive',
    icon: UserRound,
  },
  {
    to: '/body',
    label: 'Profil physique',
    description: 'Corps, santé et infos sportives',
    icon: HeartPulse,
  },
  {
    to: '/challenges',
    label: 'Défis',
    description: 'Objectifs, badges et motivation',
    icon: Target,
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
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={closeAllMenus}
            className="group flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm transition group-hover:scale-105">
              <Dumbbell className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight text-slate-900">
                Carnet de sport
              </p>

              <p className="truncate text-xs font-semibold text-emerald-600">
                Suivi & motivation
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <DesktopNavLink to="/" label="Accueil" end onClick={closeAllMenus} />

            <DesktopNavLink
              to="/workouts"
              label="Séances"
              onClick={closeAllMenus}
            />

            <DesktopDropdown
              label="Outils"
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
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
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
          'rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

function DesktopDropdown({
  label,
  links,
  isActive,
  isOpen,
  onOpen,
  onClose,
  onItemClick,
}: {
  label: string
  links: NavLinkItem[]
  isActive: boolean
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onItemClick: () => void
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        className={[
          'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive || isOpen
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')}
      >
        {label}
        <ChevronDown
          className={['h-4 w-4 transition', isOpen ? 'rotate-180' : ''].join(
            ' ',
          )}
        />
      </button>

      <div className="absolute left-0 top-full h-3 w-full" />

      <div
        className={[
          'absolute left-1/2 top-[calc(100%+0.5rem)] z-50 w-[340px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg transition duration-150',
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-2 opacity-0',
        ].join(' ')}
      >
        <div className="grid gap-1">
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
      <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-400">
        Connexion...
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        onClick={onItemClick}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <LogIn className="h-4 w-4" />
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
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        className={[
          'inline-flex max-w-[240px] items-center gap-2.5 rounded-full border px-2 py-1.5 transition',
          isActive || isOpen
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-slate-200 bg-white hover:bg-slate-50',
        ].join(' ')}
      >
        <Avatar avatarUrl={avatarUrl} displayName={displayName} />

        <span className="min-w-0 truncate text-sm font-semibold text-slate-900">
          {displayName}
        </span>

        <ChevronDown
          className={[
            'h-4 w-4 text-slate-400 transition',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      <div className="absolute left-0 top-full h-3 w-full" />

      <div
        className={[
          'absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[340px] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg transition duration-150',
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-2 opacity-0',
        ].join(' ')}
      >
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
          <Avatar avatarUrl={avatarUrl} displayName={displayName} large />

          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">{displayName}</p>

            <p className="truncate text-sm text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-2 grid gap-1">
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
            className="flex items-center gap-3 rounded-xl p-3 text-left transition hover:bg-rose-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <LogOut className="h-5 w-5" />
            </span>

            <div>
              <p className="font-semibold text-rose-600">Déconnexion</p>
              <p className="text-sm text-slate-500">Quitter ton compte</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function DropdownItem({
  to,
  icon: Icon,
  label,
  description,
  onClick,
}: {
  to: string
  icon: ComponentType<{ className?: string }>
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
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
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-screen w-full max-w-[400px] overflow-y-auto border-l border-slate-200 bg-white px-5 py-5 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Dumbbell className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-900">
                Carnet de sport
              </p>

              <p className="truncate text-xs font-semibold text-emerald-600">
                Suivi & motivation
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-2">
          <MobileBigLink to="/" icon={Home} label="Accueil" onClick={onClose} end />

          <MobileBigLink
            to="/workouts/new"
            icon={Plus}
            label="Ajouter une séance"
            onClick={onClose}
            variant="primary"
          />

          <MobileBigLink
            to="/workouts"
            icon={NotebookPen}
            label="Séances"
            onClick={onClose}
          />

          <MobileAccordion
            icon={<ToolsIcon />}
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-400">
              Connexion...
            </div>
          ) : !user ? (
            <MobileBigLink
              to="/auth"
              icon={LogIn}
              label="Se connecter"
              onClick={onClose}
            />
          ) : (
            <MobileAccordion
              icon={
                <Avatar avatarUrl={avatarUrl} displayName={displayName} large />
              }
              label={displayName}
              isOpen={openSection === 'profile'}
              onToggle={() => toggleSection('profile')}
            >
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                <Avatar
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                  large
                />

                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {displayName}
                  </p>

                  <p className="truncate text-sm text-slate-500">
                    {user.email}
                  </p>
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
                className="mt-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-rose-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <LogOut className="h-5 w-5" />
                </span>

                <div>
                  <p className="font-semibold text-rose-600">Déconnexion</p>
                  <p className="text-sm text-slate-500">Quitter ton compte</p>
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
  icon: Icon,
  label,
  onClick,
  end,
  variant = 'default',
}: {
  to: string
  icon: ComponentType<{ className?: string }>
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
        className="flex items-center gap-3 rounded-2xl bg-emerald-600 p-4 text-white shadow-sm transition hover:bg-emerald-700"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5" />
        </span>

        <span className="text-base font-semibold">{label}</span>
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
          'flex items-center gap-3 rounded-2xl border p-4 transition',
          isActive
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
        ].join(' ')
      }
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </span>

      <span className="text-base font-semibold">{label}</span>
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
  icon: React.ReactNode
  label: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 rounded-xl p-2 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          {icon}

          <span className="min-w-0 truncate text-base font-semibold text-slate-900">
            {label}
          </span>
        </span>

        <ChevronDown
          className={[
            'h-4 w-4 text-slate-400 transition',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {isOpen ? <div className="mt-1 grid gap-1">{children}</div> : null}
    </div>
  )
}

function MobileSubLink({
  to,
  icon: Icon,
  label,
  description,
  onClick,
}: {
  to: string
  icon: ComponentType<{ className?: string }>
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm leading-5 text-slate-500">{description}</p>
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
  const sizeClass = large ? 'h-11 w-11 text-base' : 'h-9 w-9 text-sm'

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        onError={() => setHasError(true)}
        className={`${sizeClass} shrink-0 rounded-full border border-slate-200 object-cover`}
      />
    )
  }

  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700`}
    >
      {getInitials(displayName)}
    </span>
  )
}

function ToolsIcon() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
      <Wrench className="h-5 w-5" />
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
