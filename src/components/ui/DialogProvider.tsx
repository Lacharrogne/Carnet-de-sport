import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  DialogContext,
  type AlertOptions,
  type ConfirmOptions,
  type DialogApi,
  type PromptOptions,
} from '../../context/dialogContext'

type ActiveDialog =
  | {
      kind: 'confirm'
      options: ConfirmOptions
      resolve: (value: boolean) => void
    }
  | {
      kind: 'prompt'
      options: PromptOptions
      resolve: (value: string | null) => void
    }
  | {
      kind: 'alert'
      options: AlertOptions
      resolve: () => void
    }

/**
 * Remplace les boîtes natives du navigateur (window.confirm / prompt / alert)
 * par de vraies fenêtres in-app, aux couleurs de Carnet de sport.
 */
export default function DialogProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveDialog | null>(null)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setActive({ kind: 'confirm', options, resolve })
    })
  }, [])

  const prompt = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setInputValue(options.defaultValue ?? '')
      setActive({ kind: 'prompt', options, resolve })
    })
  }, [])

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setActive({ kind: 'alert', options, resolve })
    })
  }, [])

  const api = useMemo<DialogApi>(
    () => ({ confirm, prompt, alert }),
    [confirm, prompt, alert],
  )

  const close = useCallback(
    (result: boolean | string | null) => {
      if (!active) return

      if (active.kind === 'confirm') {
        active.resolve(result === true)
      } else if (active.kind === 'prompt') {
        active.resolve(typeof result === 'string' ? result : null)
      } else {
        active.resolve()
      }

      setActive(null)
    },
    [active],
  )

  const cancel = useCallback(() => {
    close(active?.kind === 'prompt' ? null : false)
  }, [active, close])

  const validate = useCallback(() => {
    close(active?.kind === 'prompt' ? inputValue.trim() : true)
  }, [active, close, inputValue])

  // Fermeture au clavier + focus de l'input pour un prompt.
  useEffect(() => {
    if (!active) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    if (active.kind === 'prompt') {
      const id = window.setTimeout(() => inputRef.current?.focus(), 40)
      return () => {
        document.removeEventListener('keydown', onKeyDown)
        window.clearTimeout(id)
      }
    }

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, cancel])

  const isDanger =
    active?.kind === 'confirm' && active.options.tone === 'danger'

  const confirmClass = isDanger
    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-400'
    : 'bg-azur-400 text-slate-950 shadow-lg shadow-azur-500/20 hover:bg-azur-300'

  return (
    <DialogContext.Provider value={api}>
      {children}

      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={cancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md animate-[fadeIn_0.15s_ease] rounded-3xl border border-white/10 bg-slate-900 p-6 text-left shadow-2xl shadow-black/50">
            {active.options.title && (
              <h2 className="font-display text-lg font-black text-white">
                {active.options.title}
              </h2>
            )}

            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              {active.options.message}
            </p>

            {active.kind === 'prompt' && (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                placeholder={active.options.placeholder}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    validate()
                  }
                }}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-azur-400/60 focus:bg-white/[0.06]"
              />
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {active.kind !== 'alert' && (
                <button
                  type="button"
                  onClick={cancel}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/[0.08]"
                >
                  {active.kind === 'confirm'
                    ? active.options.cancelLabel ?? 'Annuler'
                    : active.options.cancelLabel ?? 'Annuler'}
                </button>
              )}

              <button
                type="button"
                onClick={validate}
                className={`rounded-full px-5 py-2.5 text-sm font-black transition hover:-translate-y-0.5 ${
                  active.kind === 'alert'
                    ? 'bg-azur-400 text-slate-950 shadow-lg shadow-azur-500/20 hover:bg-azur-300'
                    : confirmClass
                }`}
              >
                {active.kind === 'alert'
                  ? active.options.confirmLabel ?? 'OK'
                  : active.options.confirmLabel ?? 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}
