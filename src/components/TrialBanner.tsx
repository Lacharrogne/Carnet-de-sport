import { SUBSCRIPTION_HUB_URL } from '../config/ecosystemLinks'
import type { EntitlementStatus } from '../hooks/useEntitlement'

type TrialBannerProps = {
  status: EntitlementStatus
  daysLeft: number
}

/**
 * Bandeau d'essai (aligné sur les autres carnets) : rappelle les jours d'essai
 * restants et invite à s'abonner. Rien pour les abonnés.
 */
export default function TrialBanner({ status, daysLeft }: TrialBannerProps) {
  if (status === 'premium') {
    return null
  }

  const isExpired = status === 'expired'
  const isEnding = !isExpired && daysLeft <= 3

  const tone = isExpired
    ? 'border-red-400/25 bg-red-400/10 text-red-100'
    : isEnding
      ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
      : 'border-azur-400/25 bg-azur-400/10 text-azur-100'

  const message = isExpired
    ? 'Ton essai gratuit est terminé. Abonne-toi pour continuer à suivre tes séances.'
    : `Essai gratuit — il te reste ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`

  return (
    <div
      className={`flex flex-col gap-3 rounded-[1.25rem] border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between ${tone}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">⚡</span>
        <p className="text-sm font-bold leading-6">{message}</p>
      </div>

      <a
        href={SUBSCRIPTION_HUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit shrink-0 rounded-full bg-azur-400 px-5 py-2 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-azur-300"
      >
        S’abonner
      </a>
    </div>
  )
}
