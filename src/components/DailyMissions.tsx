import type { Mission } from '../services/missionService'

type DailyMissionsProps = {
  missions: Mission[]
}

export default function DailyMissions({ missions }: DailyMissionsProps) {
  const completedMissions = missions.filter((mission) => mission.completed)
  const completedXp = completedMissions.reduce((total, mission) => {
    return total + mission.xpReward
  }, 0)

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
            Missions du jour
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            Gagne ta dopamine quotidienne.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Les missions donnent des petits objectifs simples pour t’aider à bouger sans te prendre la tête.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
          <p className="text-sm text-emerald-300">
            Missions validées
          </p>
          <p className="mt-1 text-2xl font-black text-white">
            {completedMissions.length}/{missions.length} · +{completedXp} XP
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {missions.map((mission) => (
          <article
            key={mission.id}
            className={`rounded-3xl border p-5 transition ${
              mission.completed
                ? 'border-emerald-400/20 bg-emerald-400/10'
                : 'border-white/10 bg-slate-950/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-3xl">{mission.icon}</p>

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

            <h3 className="mt-4 text-lg font-black text-white">
              {mission.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {mission.description}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-emerald-300">
                {mission.progressLabel}
              </p>

              <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                +{mission.xpReward} XP
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}