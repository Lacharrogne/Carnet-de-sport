import { Link } from 'react-router-dom'

import BrandLogo from './BrandLogo'
import { SUBSCRIPTION_HUB_URL, VITRINE_URL } from '../config/ecosystemLinks'

type FooterLink = { label: string; to: string }

function isExternalLink(to: string) {
  return to.startsWith('http')
}

const FOOTER_SECTIONS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Explorer',
    links: [
      { label: 'Accueil', to: '/' },
      { label: 'Séances', to: '/workouts' },
      { label: 'Planning', to: '/planning' },
      { label: 'Progression', to: '/progress' },
    ],
  },
  {
    title: 'Mon carnet',
    links: [
      { label: 'Défis', to: '/challenges' },
      { label: 'Mon profil', to: '/profile' },
      { label: 'Profil physique', to: '/body' },
    ],
  },
  {
    title: 'Les Carnets',
    links: [
      { label: 'La suite', to: VITRINE_URL },
      { label: 'Tarifs', to: SUBSCRIPTION_HUB_URL },
      { label: 'Mon abonnement', to: SUBSCRIPTION_HUB_URL },
    ],
  },
]

const TRUST_SIGNALS: { icon: string; label: string }[] = [
  { icon: '❤️', label: 'Fait avec soin' },
  { icon: '🛡️', label: 'Sans publicité' },
  { icon: '✨', label: '14 jours d’essai gratuit' },
]

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-slate-950/40 text-slate-300 print:hidden">
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo className="h-11 w-11 shrink-0" />

            <div>
              <p className="font-black text-slate-50">Carnet de sport</p>
              <p className="text-sm font-semibold text-azur-300">
                Votre énergie, en mouvement
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            Séances, planning, progression et défis réunis dans un carnet
            sportif simple et motivant. Chaque effort compte, on le garde au
            clair.
          </p>

          <ul className="mt-6 space-y-2">
            {TRUST_SIGNALS.map((signal) => (
              <li
                key={signal.label}
                className="flex items-center gap-2 text-sm font-semibold text-slate-400"
              >
                <span aria-hidden className="text-base">
                  {signal.icon}
                </span>
                {signal.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title}>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-azur-300">
                {section.title}
              </p>

              <ul className="mt-4 space-y-2.5">
                {section.links.map((link, index) =>
                  isExternalLink(link.to) ? (
                    <li key={`${link.label}-${index}`}>
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-slate-400 transition hover:text-azur-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={`${link.label}-${index}`}>
                      <Link
                        to={link.to}
                        className="text-sm font-bold text-slate-400 transition hover:text-azur-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-4 text-sm text-slate-500">
          © 2026 — Carnet de sport
        </p>
      </div>
    </footer>
  )
}
