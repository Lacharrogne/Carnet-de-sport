/**
 * Écran d'attente affiché le temps qu'une page se télécharge.
 *
 * Depuis le découpage par route, chaque page arrive dans son propre fichier :
 * ce squelette occupe l'espace pendant ce court instant, pour éviter que la
 * mise en page ne sursaute.
 */
export default function PageLoader() {
  return (
    <div
      className="mx-auto w-full max-w-[1380px] px-4 py-10 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Chargement…</span>

      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/5 rounded-lg bg-white/10" />
        <div className="h-4 w-3/5 rounded bg-white/5" />

        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 rounded-2xl bg-white/5" />
          <div className="h-32 rounded-2xl bg-white/5" />
          <div className="h-32 rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  )
}
