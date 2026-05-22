import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import NextPlannedWorkoutCard from '../components/NextPlannedWorkoutCard'
import WeeklyGoalCard from '../components/WeeklyGoalCard'
import WorkoutCard from '../components/WorkoutCard'
import type { PlannedWorkout } from '../types/plannedWorkout'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Workout } from '../types/workout'

type DashboardPageProps = {
  workouts: Workout[]
  plannedWorkouts: PlannedWorkout[]
  weeklyGoal: WeeklyGoal
  onWeeklyGoalChange: (weeklyGoal: WeeklyGoal) => void
  onAddWorkoutClick: () => void
}

export default function DashboardPage({
  workouts,
  plannedWorkouts,
  weeklyGoal,
  onWeeklyGoalChange,
  onAddWorkoutClick,
}: DashboardPageProps) {
  const navigate = useNavigate()

  const today = getTodayDate()
  const startOfWeek = getStartOfWeek()
  const endOfWeek = getEndOfWeek()

  const sortedWorkouts = [...workouts].sort((a, b) => {
    return (
      getDateFromString(b.date).getTime() -
      getDateFromString(a.date).getTime()
    )
  })

  const latestWorkouts = sortedWorkouts.slice(0, 3)

  const upcomingPlannedWorkouts = plannedWorkouts
    .filter((plannedWorkout) => {
      return getDateFromString(plannedWorkout.date).getTime() >= today.getTime()
    })
    .sort((a, b) => {
      return (
        getDateFromString(a.date).getTime() -
        getDateFromString(b.date).getTime()
      )
    })

  const weeklyWorkouts = workouts.filter((workout) => {
    const workoutDate = getDateFromString(workout.date)

    return workoutDate >= startOfWeek && workoutDate <= endOfWeek
  })

  const totalWorkouts = workouts.length

  const totalDuration = workouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const weeklyDuration = weeklyWorkouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const recordCount = workouts.filter((workout) => {
    return workout.trend === 'record'
  }).length

  const weeklyGoalProgress =
    weeklyGoal.targetMinutes > 0
      ? Math.min(
          Math.round((weeklyDuration / weeklyGoal.targetMinutes) * 100),
          100,
        )
      : 0

  const handleOpenWorkout = (workoutId: string) => {
    navigate(`/workouts/${workoutId}`)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-slate-50">
      <section className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <DashboardHero
          totalWorkouts={totalWorkouts}
          totalDuration={totalDuration}
          upcomingCount={upcomingPlannedWorkouts.length}
          weeklyDuration={weeklyDuration}
          weeklyTarget={weeklyGoal.targetMinutes}
          weeklyProgress={weeklyGoalProgress}
          onAddWorkoutClick={onAddWorkoutClick}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <WeeklyGoalCard
              workouts={workouts}
              weeklyGoal={weeklyGoal}
              onWeeklyGoalChange={onWeeklyGoalChange}
            />

            <RecentWorkoutsSection
              workouts={latestWorkouts}
              onAddWorkoutClick={onAddWorkoutClick}
              onOpenWorkout={handleOpenWorkout}
            />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <NextPlannedWorkoutCard plannedWorkouts={plannedWorkouts} />

            <QuickActions onAddWorkoutClick={onAddWorkoutClick} />

            <MiniSummary
              totalWorkouts={totalWorkouts}
              totalDuration={totalDuration}
              weeklyDuration={weeklyDuration}
              weeklyWorkoutsCount={weeklyWorkouts.length}
              upcomingCount={upcomingPlannedWorkouts.length}
              recordCount={recordCount}
            />
          </aside>
        </div>
      </section>
    </main>
  )
}

function DashboardHero({
  totalWorkouts,
  totalDuration,
  upcomingCount,
  weeklyDuration,
  weeklyTarget,
  weeklyProgress,
  onAddWorkoutClick,
}: {
  totalWorkouts: number
  totalDuration: number
  upcomingCount: number
  weeklyDuration: number
  weeklyTarget: number
  weeklyProgress: number
  onAddWorkoutClick: () => void
}) {
  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 via-white/[0.04] to-sky-400/10 p-5 shadow-2xl shadow-black/25 sm:p-7 lg:p-8">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
            Carnet de sport
          </p>

          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ton suivi sportif, simple et motivant.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Ajoute tes séances, suis ton objectif de la semaine et prépare ton
            prochain entraînement sans transformer ton dashboard en tableau de
            bord compliqué.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onAddWorkoutClick}
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
            >
              + Ajouter une séance
            </button>

            <Link
              to="/planning"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-black text-slate-100 transition hover:bg-white/10"
            >
              Voir le planning
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeroStat
              label="Séances"
              value={totalWorkouts}
              description="dans ton carnet"
            />

            <HeroStat
              label="Temps total"
              value={formatDuration(totalDuration)}
              description="d’activité enregistrée"
            />

            <HeroStat
              label="À venir"
              value={upcomingCount}
              description={
                upcomingCount > 1 ? 'séances prévues' : 'séance prévue'
              }
            />
          </div>
        </div>

        <WeekFocusCard
          weeklyDuration={weeklyDuration}
          targetMinutes={weeklyTarget}
          progress={weeklyProgress}
        />
      </div>
    </header>
  )
}

function WeekFocusCard({
  weeklyDuration,
  targetMinutes,
  progress,
}: {
  weeklyDuration: number
  targetMinutes: number
  progress: number
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Objectif semaine
          </p>

          <p className="mt-3 text-4xl font-black text-white">{progress}%</p>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300">
          🎯 Focus
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-950">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        {targetMinutes > 0 ? (
          <>
            {formatDuration(weeklyDuration)} réalisés sur{' '}
            {formatDuration(targetMinutes)} prévus.
          </>
        ) : (
          <>Définis un objectif pour mieux suivre ta semaine.</>
        )}
      </p>

      <Link
        to="/progress"
        className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-slate-100 transition hover:bg-white/10"
      >
        Voir ma progression
      </Link>
    </div>
  )
}

function RecentWorkoutsSection({
  workouts,
  onAddWorkoutClick,
  onOpenWorkout,
}: {
  workouts: Workout[]
  onAddWorkoutClick: () => void
  onOpenWorkout: (workoutId: string) => void
}) {
  return (
    <Panel>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
            Dernières séances
          </p>

          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Ton historique récent
          </h2>
        </div>

        <Link
          to="/workouts"
          className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-black text-slate-100 transition hover:bg-white/10"
        >
          Voir le carnet
        </Link>
      </div>

      {workouts.length > 0 ? (
        <div
          className={
            workouts.length === 1
              ? 'max-w-md'
              : 'grid gap-4 lg:grid-cols-2 2xl:grid-cols-3'
          }
        >
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onOpen={onOpenWorkout}
              variant="compact"
            />
          ))}
        </div>
      ) : (
        <EmptyState onAddWorkoutClick={onAddWorkoutClick} />
      )}
    </Panel>
  )
}

function QuickActions({
  onAddWorkoutClick,
}: {
  onAddWorkoutClick: () => void
}) {
  return (
    <Panel title="Actions rapides" accent="emerald">
      <div className="grid gap-3">
        <button
          type="button"
          onClick={onAddWorkoutClick}
          className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-left transition hover:bg-emerald-400/15"
        >
          <p className="text-base font-black text-white sm:text-lg">
            + Ajouter une séance
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            Note ton entraînement du jour.
          </p>
        </button>

        <ActionLink
          to="/planning"
          title="Planning"
          text="Préparer tes prochaines séances."
          icon="📅"
        />

        <ActionLink
          to="/progress"
          title="Progression"
          text="Voir ton niveau, ton XP et tes badges."
          icon="📊"
        />

        <ActionLink
          to="/challenges"
          title="Défis"
          text="Retrouver les objectifs à compléter."
          icon="🎯"
        />
      </div>
    </Panel>
  )
}

function MiniSummary({
  totalWorkouts,
  totalDuration,
  weeklyDuration,
  weeklyWorkoutsCount,
  upcomingCount,
  recordCount,
}: {
  totalWorkouts: number
  totalDuration: number
  weeklyDuration: number
  weeklyWorkoutsCount: number
  upcomingCount: number
  recordCount: number
}) {
  return (
    <Panel title="Résumé express">
      <div className="space-y-3">
        <SummaryLine label="Séances totales" value={`${totalWorkouts}`} />

        <SummaryLine label="Temps total" value={formatDuration(totalDuration)} />

        <SummaryLine
          label="Cette semaine"
          value={`${weeklyWorkoutsCount} séance${
            weeklyWorkoutsCount > 1 ? 's' : ''
          } · ${formatDuration(weeklyDuration)}`}
        />

        <SummaryLine label="Séances à venir" value={`${upcomingCount}`} />

        <SummaryLine label="Records" value={`${recordCount} 🔥`} />
      </div>
    </Panel>
  )
}

function Panel({
  title,
  children,
  accent = 'default',
}: {
  title?: string
  children: ReactNode
  accent?: 'default' | 'emerald'
}) {
  const titleColor =
    accent === 'emerald' ? 'text-emerald-300' : 'text-slate-500'

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
      {title ? (
        <p
          className={`text-xs font-black uppercase tracking-[0.24em] ${titleColor}`}
        >
          {title}
        </p>
      ) : null}

      <div className={title ? 'mt-5' : ''}>{children}</div>
    </section>
  )
}

function HeroStat({
  label,
  value,
  description,
}: {
  label: string
  value: string | number
  description: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-white">{value}</p>

      <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
    </div>
  )
}

function ActionLink({
  to,
  title,
  text,
  icon,
}: {
  to: string
  title: string
  text: string
  icon: string
}) {
  return (
    <Link
      to={to}
      className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 transition hover:bg-white/[0.06]"
    >
      <div className="flex items-start gap-4">
        <p className="text-2xl">{icon}</p>

        <div>
          <p className="font-black text-white">{title}</p>

          <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
        </div>
      </div>
    </Link>
  )
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/50 px-5 py-4">
      <p className="text-sm font-bold text-slate-400">{label}</p>

      <p className="text-right text-sm font-black text-white">{value}</p>
    </div>
  )
}

function EmptyState({
  onAddWorkoutClick,
}: {
  onAddWorkoutClick: () => void
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-8 text-center">
      <p className="text-5xl">🌱</p>

      <h3 className="mt-4 text-2xl font-black text-white">
        Aucune séance pour le moment.
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-400">
        Ajoute ton premier entraînement pour commencer à construire ton
        historique.
      </p>

      <button
        type="button"
        onClick={onAddWorkoutClick}
        className="mt-6 rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
      >
        Créer ma première séance
      </button>
    </div>
  )
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes} min`
}

function getTodayDate() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return today
}

function getStartOfWeek() {
  const today = getTodayDate()
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day

  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() + diff)
  startOfWeek.setHours(0, 0, 0, 0)

  return startOfWeek
}

function getEndOfWeek() {
  const startOfWeek = getStartOfWeek()
  const endOfWeek = new Date(startOfWeek)

  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return endOfWeek
}

function getDateFromString(date: string) {
  return new Date(`${date}T00:00:00`)
}