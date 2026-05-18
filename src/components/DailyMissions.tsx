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
              ? 'border-emerald-400/25 bg-emerald-400/10 shadow-lg shadow-emerald-400/5'
              : 'border-white/10 bg-slate-950/50 hover:border-emerald-400/30 hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-3xl">
              {mission.icon}
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                mission.completed
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {mission.completed ? 'Validée' : 'En cours'}
            </span>
          </div>

          <div className="mt-5 flex flex-1 flex-col">
            <h3 className="text-xl font-black leading-tight text-white">
              {mission.title}
            </h3>

            <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">
              {mission.description}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <p
              className={`text-sm font-black ${
                mission.completed ? 'text-emerald-300' : 'text-slate-400'
              }`}
            >
              {mission.completed ? 'Objectif rempli' : 'À compléter'}
            </p>

            <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
              +{mission.xpReward} XP
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}