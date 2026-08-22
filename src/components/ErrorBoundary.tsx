import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
  /**
   * Quand cette valeur change (ex : le chemin de la page), on réinitialise
   * l'erreur pour laisser une nouvelle page s'afficher après une navigation.
   */
  resetKey?: string
}

type ErrorBoundaryState = {
  hasError: boolean
}

/**
 * Garde-fou global : si un composant plante au rendu, on affiche un écran
 * doux plutôt qu'une page blanche. L'erreur est loggée pour le suivi.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur de rendu interceptée :', error, info)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <main className="min-h-screen px-6 py-16 text-slate-50">
        <section className="mx-auto max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
          <p className="text-5xl">⚡</p>

          <h1 className="mt-5 font-display text-3xl font-black text-white">
            Oups, un petit accroc
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            Cette page n'a pas pu s'afficher correctement. Pas de panique, tes
            séances sont en sécurité. Recharge la page ou reviens à l'accueil.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-azur-500 px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-azur-600"
            >
              Recharger la page
            </button>

            <a
              href="/"
              className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 font-black text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
            >
              Retour à l'accueil
            </a>
          </div>
        </section>
      </main>
    )
  }
}
