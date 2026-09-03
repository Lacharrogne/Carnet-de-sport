import { useEffect, useState } from 'react'

import {
  INSTALL_AVAILABILITY_EVENT,
  clearDeferredPrompt,
  getDeferredPrompt,
  type BeforeInstallPromptEvent,
} from '../lib/installPrompt'

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V4" />
      <polyline points="8 8 12 4 16 8" />
      <path d="M8 12H6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-2" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/**
 * Bannière discrète « Installer l'application » (PWA).
 *
 * - Android/Chrome : capte `beforeinstallprompt` et déclenche l'invite native.
 * - iOS/Safari : `beforeinstallprompt` n'existe pas → on affiche la marche à
 *   suivre manuelle (Partager → Sur l'écran d'accueil).
 * - Masquée si déjà installée (mode standalone) ou déjà refusée une fois.
 */

const DISMISS_KEY = 'installPromptDismissed'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    try {
      if (localStorage.getItem(DISMISS_KEY)) return
    } catch {
      /* localStorage indisponible : on continue sans mémoire */
    }

    // L'événement a pu être capté avant le montage (surtout sur PC) : on lit
    // d'abord ce qui a déjà été mémorisé au chargement.
    const existing = getDeferredPrompt()
    if (existing) {
      setDeferred(existing)
      setVisible(true)
    }

    // Puis on réagit aux changements de disponibilité (capté après coup, ou
    // remis à zéro après installation).
    const onAvailability = () => {
      const current = getDeferredPrompt()
      setDeferred(current)
      if (current) {
        setVisible(true)
      }
    }
    window.addEventListener(INSTALL_AVAILABILITY_EVENT, onAvailability)

    if (isIos()) setVisible(true)

    const onInstalled = () => {
      setVisible(false)
      try {
        localStorage.setItem(DISMISS_KEY, '1')
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener(INSTALL_AVAILABILITY_EVENT, onAvailability)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const install = async () => {
    if (isIos()) {
      setShowIosHelp((value) => !value)
      return
    }
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    clearDeferredPrompt()
    setDeferred(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md sm:inset-x-auto sm:left-1/2 sm:w-[26rem] sm:-translate-x-1/2">
      <div className="rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-start gap-3">
          <img
            src="/icon-192.png"
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl shadow-sm ring-1 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-black text-white">
              Installer Carnet de sport
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              Ajoute l'app à ton écran d'accueil pour un accès direct, en plein
              écran.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Masquer"
            className="shrink-0 rounded-full p-1 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {showIosHelp ? (
          <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-azur-500/15 px-3 py-2.5 text-xs font-semibold text-azur-200">
            Appuie sur
            <ShareIcon className="mx-0.5 inline h-3.5 w-3.5" />
            puis « Sur l'écran d'accueil ».
          </p>
        ) : (
          <button
            type="button"
            onClick={install}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-azur-400 px-4 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-azur-500/20 transition hover:-translate-y-0.5 hover:bg-azur-300"
          >
            <DownloadIcon className="h-4 w-4" />
            {isIos() ? 'Comment installer' : "Installer l'application"}
          </button>
        )}
      </div>
    </div>
  )
}
