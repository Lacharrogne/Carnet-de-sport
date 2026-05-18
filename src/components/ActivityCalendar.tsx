import type { Workout } from '../types/workout'

type ActivityCalendarProps = {
  workouts: Workout[]
}

type CalendarDay = {
  date: Date
  dateKey: string
  workoutCount: number
  duration: number
}

export default function ActivityCalendar({ workouts }: ActivityCalendarProps) {
  const workoutStatsByDate = getWorkoutStatsByDate(workouts)

  const days: CalendarDay[] = Array.from({ length: 28 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (27 - index))

    const dateKey = getDateKey(date)
    const stats = workoutStatsByDate.get(dateKey)

    return {
      date,
      dateKey,
      workoutCount: stats?.workoutCount ?? 0,
      duration: stats?.duration ?? 0,
    }
  })

  const activeDays = days.filter((day) => {
    return day.workoutCount > 0
  }).length

  const totalSessions = days.reduce((total, day) => {
    return total + day.workoutCount
  }, 0)

  const totalDuration = days.reduce((total, day) => {
    return total + day.duration
  }, 0)

  const bestDay = days.reduce((best, day) => {
    if (day.workoutCount > best.workoutCount) {
      return day
    }

    if (day.workoutCount === best.workoutCount && day.duration > best.duration) {
      return day
    }

    return best
  }, days[0])

  const regularityPercent = Math.round((activeDays / 28) * 100)

  return (
    <section className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative flex h-full flex-col gap-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Calendrier d’activité
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
              Tes 28 derniers jours.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Chaque case représente une journée. Plus tu ajoutes de séances,
              plus ton mois devient vivant.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <StatCard label="Jours actifs" value={`${activeDays}/28`} />
            <StatCard label="Séances" value={String(totalSessions)} />
            <StatCard label="Minutes" value={String(totalDuration)} />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-300">
                Régularité
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {getRegularityMessage(regularityPercent)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
              <p className="text-sm font-black text-emerald-300">
                {regularityPercent}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:grid-cols-[repeat(14,minmax(0,1fr))]">
            {days.map((day) => {
              const isToday = day.dateKey === getDateKey(new Date())
              const intensity = getActivityIntensity(day.workoutCount, day.duration)

              return (
                <div
                  key={day.dateKey}
                  title={`${formatDate(day.date)} — ${day.workoutCount} séance${
                    day.workoutCount > 1 ? 's' : ''
                  } · ${day.duration} min`}
                  className={[
                    'group relative flex h-14 flex-col items-center justify-center rounded-2xl border text-center transition hover:-translate-y-1 hover:scale-105',
                    getDayClass(intensity),
                    isToday ? 'ring-2 ring-emerald-300/70' : '',
                  ].join(' ')}
                >
                  <p className="text-xs font-black">
                    {day.date.getDate()}
                  </p>

                  {day.workoutCount > 0 ? (
                    <p className="mt-0.5 text-[11px] font-black">
                      {day.workoutCount}x
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] font-bold opacity-50">
                      —
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
              <span>Repos</span>

              <span className="h-4 w-4 rounded-md border border-white/10 bg-slate-950/60" />
              <span className="h-4 w-4 rounded-md border border-emerald-400/30 bg-emerald-400/15" />
              <span className="h-4 w-4 rounded-md border border-emerald-400/50 bg-emerald-400/35" />
              <span className="h-4 w-4 rounded-md border border-emerald-300/70 bg-emerald-300" />

              <span>Très actif</span>
            </div>

            <p className="text-sm font-bold text-slate-400">
              Meilleur jour :{' '}
              <span className="text-white">
                {bestDay.workoutCount} séance{bestDay.workoutCount > 1 ? 's' : ''}
              </span>
              {' · '}
              <span className="text-emerald-300">
                {bestDay.duration} min
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  )
}

function getWorkoutStatsByDate(workouts: Workout[]) {
  const statsByDate = new Map<
    string,
    {
      workoutCount: number
      duration: number
    }
  >()

  workouts.forEach((workout) => {
    const currentStats = statsByDate.get(workout.date)

    statsByDate.set(workout.date, {
      workoutCount: (currentStats?.workoutCount ?? 0) + 1,
      duration: (currentStats?.duration ?? 0) + workout.duration,
    })
  })

  return statsByDate
}

function getActivityIntensity(workoutCount: number, duration: number) {
  if (workoutCount === 0) {
    return 0
  }

  if (workoutCount >= 2 || duration >= 90) {
    return 3
  }

  if (duration >= 45) {
    return 2
  }

  return 1
}

function getDayClass(intensity: number) {
  if (intensity === 3) {
    return 'border-emerald-300/70 bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-400/20'
  }

  if (intensity === 2) {
    return 'border-emerald-400/50 bg-emerald-400/35 text-white'
  }

  if (intensity === 1) {
    return 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100'
  }

  return 'border-white/10 bg-slate-950/60 text-slate-500'
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

function getRegularityMessage(regularityPercent: number) {
  if (regularityPercent >= 70) {
    return 'Excellent rythme. Ton mois est vraiment actif.'
  }

  if (regularityPercent >= 40) {
    return 'Bonne base. Quelques séances en plus peuvent faire monter la régularité.'
  }

  if (regularityPercent > 0) {
    return 'Le rythme commence. L’objectif est de remplir quelques cases de plus.'
  }

  return 'Aucune activité sur les 28 derniers jours. Une première séance suffit pour lancer la dynamique.'
}