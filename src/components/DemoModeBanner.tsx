import { Link } from 'react-router-dom'

export default function DemoModeBanner() {
  return (
    <section className="border-b border-amber-300/20 bg-amber-300/10 px-6 py-4 text-amber-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-black">
            Mode démo
          </p>

          <p className="text-sm text-amber-100/80">
            Tu peux tester l’application, mais tes modifications ne seront pas sauvegardées.
          </p>
        </div>

        <Link
          to="/auth"
          className="rounded-full bg-amber-300 px-5 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-amber-200"
        >
          Se connecter pour sauvegarder
        </Link>
      </div>
    </section>
  )
}