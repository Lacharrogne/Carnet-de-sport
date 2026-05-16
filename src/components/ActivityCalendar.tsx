import type { Workout } from '../types/workout'

type ActivityCalendarProps = {
  workouts: Workout[]
}

export default function ActivityCalendar({ workouts }: ActivityCalendarProps) {
  const days = Array.from({ length: 28 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (27 - index))

    const dateKey = getDateKey(date)

    const workoutCount = workouts.filter((workout) => {
      return workout.date === dateKey
    }).length

    return {
      date,
      dateKey,
      workoutCount,
    }
  })

  const activeDays = days.filter((day) => day.workoutCount > 0).length

  const bestDay = days.reduce((best, day) => {
    if (day.workoutCount > best.workoutCount) {
      return day
    }

    return best
  }, days[0])

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
            Calendrier d’activité
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            Tes 28 derniers jours.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Chaque case représente une journée. Plus tu ajoutes de séances, plus ton mois
            devient vivant.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 lg:min-w-64">
          <p className="text-sm text-emerald-300">Jours actifs</p>

          <p className="mt-2 text-4xl font-black text-white">
            {activeDays}/28
          </p>

          <p className="mt-2 text-sm text-slate-300">
            Meilleur jour : {bestDay.workoutCount} séance
            {bestDay.workoutCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
        <div className="grid grid-cols-7 gap-2 sm:grid-cols-14">
          {days.map((day) => {
            const isActive = day.workoutCount > 0
            const isVeryActive = day.workoutCount >= 2
            const isToday = day.dateKey === getDateKey(new Date())

            return (
              <div
                key={day.dateKey}
                title={`${formatDate(day.date)} — ${day.workoutCount} séance${
                  day.workoutCount > 1 ? 's' : ''
                }`}
                className={[
                  'flex h-14 flex-col items-center justify-center rounded-2xl border text-center transition hover:-translate-y-1 hover:scale-105',
                  isVeryActive
                    ? 'border-emerald-300/70 bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-400/20'
                    : isActive
                      ? 'border-emerald-400/50 bg-emerald-400/30 text-white'
                      : 'border-white/10 bg-slate-950/60 text-slate-500',
                  isToday ? 'ring-2 ring-emerald-300/60' : '',
                ].join(' ')}
              >
                <p className="text-xs font-bold">
                  {day.date.getDate()}
                </p>

                {isActive && (
                  <p className="mt-0.5 text-[11px] font-black">
                    {day.workoutCount}x
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
          <span>Moins actif</span>

          <span className="h-4 w-4 rounded-md border border-white/10 bg-slate-950/60" />
          <span className="h-4 w-4 rounded-md border border-emerald-400/50 bg-emerald-400/30" />
          <span className="h-4 w-4 rounded-md border border-emerald-300/70 bg-emerald-300" />

          <span>Plus actif</span>
        </div>
      </div>
    </section>
  )
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}