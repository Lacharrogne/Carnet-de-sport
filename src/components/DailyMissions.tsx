import type { Mission } from '../services/missionService'

type DailyMissionsProps = {
  missions: Mission[]
}

export default function DailyMissions({ missions }: DailyMissionsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {missions.map((mission) => (
        <article
          key={mission.id}
          className={`flex min-h-[230px] flex-col rounded-3xl border p-5 transition ${
            mission.completed
              ? 'border-emerald-200 bg-emerald-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              {mission.icon}
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                mission.completed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {mission.completed ? 'Validée' : 'En cours'}
            </span>
          </div>

          <div className="mt-5 flex flex-1 flex-col">
            <h3 className="text-xl font-bold leading-tight text-slate-900">
              {mission.title}
            </h3>

            <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
              {mission.description}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <p
              className={`text-sm font-bold ${
                mission.completed ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {mission.completed ? 'Objectif rempli' : 'À compléter'}
            </p>

            <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-900">
              +{mission.xpReward} XP
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}