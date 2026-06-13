import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'

export default function DemoModeBanner() {
  return (
    <section className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Info className="h-5 w-5" />
          </span>

          <div>
            <p className="font-semibold">Mode démo</p>

            <p className="text-sm text-amber-800">
              Tu peux tester l’application, mais tes modifications ne seront pas
              sauvegardées.
            </p>
          </div>
        </div>

        <Link
          to="/auth"
          className="shrink-0 rounded-full bg-amber-500 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Se connecter pour sauvegarder
        </Link>
      </div>
    </section>
  )
}
