import { Component, type ErrorInfo, type ReactNode } from 'react'

import Button from './ui/Button'

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
          <img
            src="/logo.png"
            alt="Carnet de sport"
            className="mx-auto h-16 w-16 object-contain"
          />

          <h1 className="mt-5 font-display text-3xl font-black text-white">
            Oups, un petit accroc
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            Cette page n'a pas pu s'afficher correctement. Pas de panique, tes
            séances sont en sécurité. Recharge la page ou reviens à l'accueil.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </Button>

            <Button variant="secondary" size="lg" to="/">
              Retour à l'accueil
            </Button>
          </div>
        </section>
      </main>
    )
  }
}
