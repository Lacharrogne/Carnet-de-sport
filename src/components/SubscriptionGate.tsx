import { VITRINE_URL } from '../config/ecosystemLinks'

const HUB_URL = `${VITRINE_URL}/#hub`

/**
 * Écran de verrouillage affiché quand l'essai est terminé et que l'utilisateur
 * n'a pas d'abonnement qui débloque le Carnet de sport. Ne s'affiche que si
 * `ENFORCE_TRIAL` est activé (donc inerte tant que le paiement n'est pas lancé).
 */
export default function SubscriptionGate() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5 text-slate-50">
      <section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30 sm:p-10">
        <img
          src="/logo.png"
          alt="Carnet de sport"
          className="mx-auto h-16 w-16 object-contain"
        />

        <h1 className="mt-5 font-display text-3xl font-black text-white sm:text-4xl">
          Ton essai est terminé.
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-300">
          Débloque le Carnet de sport pour continuer à suivre tes séances, ta
          progression et tes records. Tu peux t’abonner à ce carnet seul, ou à
          l’offre complète « Les Carnets » qui débloque les trois.
        </p>

        <a
          href={HUB_URL}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-azur-400 px-7 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-azur-300"
        >
          Voir les abonnements
        </a>

        <p className="mt-4 text-sm text-slate-500">
          Tes données sont conservées : tout revient dès que tu t’abonnes.
        </p>
      </section>
    </main>
  )
}
