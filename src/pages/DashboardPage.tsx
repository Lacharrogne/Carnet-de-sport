import type { ComponentType, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Plus,
  Sprout,
  Target,
  TrendingUp,
} from 'lucide-react'

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

  const sortedWorkouts = [...workouts].sort((a, b) => {
    return (
      getDateFromString(b.date).getTime() - getDateFromString(a.date).getTime()
    )
  })

  const latestWorkouts = sortedWorkouts.slice(0, 3)

  const upcomingPlannedWorkouts = plannedWorkouts.filter((plannedWorkout) => {
    return getDateFromString(plannedWorkout.date).getTime() >= today.getTime()
  })

  const totalWorkouts = workouts.length

  const totalDuration = workouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const handleOpenWorkout = (workoutId: string) => {
    navigate(`/workouts/${workoutId}`)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHero
          totalWorkouts={totalWorkouts}
          totalDuration={totalDuration}
          upcomingCount={upcomingPlannedWorkouts.length}
          onAddWorkoutClick={onAddWorkoutClick}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <NextPlannedWorkoutCard plannedWorkouts={plannedWorkouts} />

            <QuickActions onAddWorkoutClick={onAddWorkoutClick} />
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
  onAddWorkoutClick,
}: {
  totalWorkouts: number
  totalDuration: number
  upcomingCount: number
  onAddWorkoutClick: () => void
}) {
  return (
    <header className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
        Carnet de sport
      </p>

      <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
        Ton suivi sportif, simple et motivant.
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
        Ajoute tes séances, garde un œil sur ton objectif de la semaine et
        prépare ton prochain entraînement. Rien de superflu.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAddWorkoutClick}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Ajouter une séance
        </button>

        <Link
          to="/planning"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <CalendarDays className="h-4 w-4" />
          Voir le planning
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <HeroStat
          icon={TrendingUp}
          label="Séances"
          value={String(totalWorkouts)}
          description="dans ton carnet"
        />

        <HeroStat
          icon={Clock}
          label="Temps total"
          value={formatDuration(totalDuration)}
          description="d’activité enregistrée"
        />

        <HeroStat
          icon={CalendarDays}
          label="À venir"
          value={String(upcomingCount)}
          description={upcomingCount > 1 ? 'séances prévues' : 'séance prévue'}
        />
      </div>
    </header>
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
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Dernières séances
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Ton historique récent
          </h2>
        </div>

        <Link
          to="/workouts"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Voir le carnet
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {workouts.length > 0 ? (
        <div
          className={
            workouts.length === 1 ? 'max-w-md' : 'grid gap-4 lg:grid-cols-2'
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
    <Panel title="Actions rapides">
      <div className="grid gap-2">
        <button
          type="button"
          onClick={onAddWorkoutClick}
          className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-left transition hover:bg-emerald-100"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Plus className="h-5 w-5" />
          </span>

          <div>
            <p className="font-semibold text-slate-900">Ajouter une séance</p>
            <p className="text-sm text-slate-500">Note ton entraînement du jour.</p>
          </div>
        </button>

        <ActionLink
          to="/planning"
          title="Planning"
          text="Préparer tes prochaines séances."
          icon={CalendarDays}
        />

        <ActionLink
          to="/progress"
          title="Progression"
          text="Ton niveau, ton XP et tes badges."
          icon={TrendingUp}
        />

        <ActionLink
          to="/challenges"
          title="Défis"
          text="Les objectifs à compléter."
          icon={Target}
        />
      </div>
    </Panel>
  )
}

function Panel({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {title ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>
      ) : null}

      <div className={title ? 'mt-4' : ''}>{children}</div>
    </section>
  )
}

function HeroStat({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-emerald-600">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

      <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  )
}

function ActionLink({
  to,
  title,
  text,
  icon: Icon,
}: {
  to: string
  title: string
  text: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </Link>
  )
}

function EmptyState({
  onAddWorkoutClick,
}: {
  onAddWorkoutClick: () => void
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
        <Sprout className="h-7 w-7" />
      </span>

      <h3 className="mt-4 text-xl font-bold text-slate-900">
        Aucune séance pour le moment.
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
        Ajoute ton premier entraînement pour commencer à construire ton
        historique.
      </p>

      <button
        type="button"
        onClick={onAddWorkoutClick}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        <Plus className="h-4 w-4" />
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

function getDateFromString(date: string) {
  return new Date(`${date}T00:00:00`)
}
