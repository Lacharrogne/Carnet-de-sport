import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'

import AppNavigation from './components/AppNavigation'
import { WORKOUTS } from './data/workouts'
import BodyPage from './pages/BodyPage'
import DashboardPage from './pages/DashboardPage'
import EditWorkoutPage from './pages/EditWorkoutPage'
import NewWorkoutPage from './pages/NewWorkoutPage'
import ProgressPage from './pages/ProgressPage'
import WorkoutsPage from './pages/WorkoutsPage'
import {
  DEFAULT_HEALTH_PROFILE,
  getStoredHealthProfile,
  saveHealthProfile,
} from './services/healthProfileStorage'
import { getStoredWorkouts, saveWorkouts } from './services/workoutStorage'
import type { HealthProfile } from './types/health'
import type { Workout, WorkoutFormValues } from './types/workout'
import PlanningPage from './pages/PlanningPage'
import {
  getStoredPlannedWorkouts,
  savePlannedWorkouts,
} from './services/plannedWorkoutStorage'
import type { PlannedWorkout } from './types/plannedWorkout'
import {
  DEFAULT_WEEKLY_GOAL,
  getStoredWeeklyGoal,
  saveWeeklyGoal,
} from './services/weeklyGoalStorage'
import type { WeeklyGoal } from './types/weeklyGoal'
import ChallengesPage from './pages/ChallengesPage'

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

function AppShell() {
  const navigate = useNavigate()

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    return getStoredWorkouts() ?? WORKOUTS
  })

  const [healthProfile, setHealthProfile] = useState<HealthProfile>(() => {
    return getStoredHealthProfile() ?? DEFAULT_HEALTH_PROFILE
  })

  const [plannedWorkouts, setPlannedWorkouts] = useState<PlannedWorkout[]>(() => {
  return getStoredPlannedWorkouts() ?? []
})

const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal>(() => {
  return getStoredWeeklyGoal() ?? DEFAULT_WEEKLY_GOAL
})

useEffect(() => {
  saveWeeklyGoal(weeklyGoal)
}, [weeklyGoal])

useEffect(() => {
  savePlannedWorkouts(plannedWorkouts)
}, [plannedWorkouts])

  useEffect(() => {
    saveWorkouts(workouts)
  }, [workouts])

  useEffect(() => {
    saveHealthProfile(healthProfile)
  }, [healthProfile])

  const handleAddWorkout = (values: WorkoutFormValues) => {
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      ...values,
    }

    setWorkouts((currentWorkouts) => [newWorkout, ...currentWorkouts])
    navigate('/')
  }

  const handleAddPlannedWorkout = (plannedWorkout: PlannedWorkout) => {
  setPlannedWorkouts((currentPlannedWorkouts) => [
    plannedWorkout,
    ...currentPlannedWorkouts,
  ])
}

const handleDeletePlannedWorkout = (plannedWorkoutId: string) => {
  const plannedWorkoutToDelete = plannedWorkouts.find((plannedWorkout) => {
    return plannedWorkout.id === plannedWorkoutId
  })

  if (!plannedWorkoutToDelete) {
    return
  }

  const confirmed = window.confirm(
    `Supprimer la séance prévue "${plannedWorkoutToDelete.title}" ?`
  )

  if (!confirmed) {
    return
  }

  setPlannedWorkouts((currentPlannedWorkouts) => {
    return currentPlannedWorkouts.filter((plannedWorkout) => {
      return plannedWorkout.id !== plannedWorkoutId
    })
  })
}

const handleCompletePlannedWorkout = (plannedWorkout: PlannedWorkout) => {
  const confirmed = window.confirm(
    `Transformer "${plannedWorkout.title}" en séance réalisée ?`
  )

  if (!confirmed) {
    return
  }

  const completedWorkout: Workout = {
    id: crypto.randomUUID(),
    title: plannedWorkout.title,
    category: plannedWorkout.category,
    date: plannedWorkout.date,
    duration: plannedWorkout.duration,
    intensity: 'Moyenne',
    feeling: 'Bon',
    notes: plannedWorkout.objective,
    improvementIdea: '',
    trend: 'stable',
  }

  setWorkouts((currentWorkouts) => [completedWorkout, ...currentWorkouts])

  setPlannedWorkouts((currentPlannedWorkouts) => {
    return currentPlannedWorkouts.filter((item) => {
      return item.id !== plannedWorkout.id
    })
  })

  navigate('/workouts')
}

  const handleEditWorkout = (
    workoutId: string,
    values: WorkoutFormValues
  ) => {
    setWorkouts((currentWorkouts) => {
      return currentWorkouts.map((workout) => {
        if (workout.id !== workoutId) {
          return workout
        }

        return {
          id: workout.id,
          ...values,
        }
      })
    })

    navigate('/workouts')
  }

  const handleDeleteWorkout = (workoutId: string) => {
    const workoutToDelete = workouts.find((workout) => workout.id === workoutId)

    if (!workoutToDelete) {
      return
    }

    const confirmed = window.confirm(
      `Supprimer la séance "${workoutToDelete.title}" ?`
    )

    if (!confirmed) {
      return
    }

    setWorkouts((currentWorkouts) => {
      return currentWorkouts.filter((workout) => workout.id !== workoutId)
    })
  }

  return (
    <>
      <AppNavigation />

      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              workouts={workouts}
              plannedWorkouts={plannedWorkouts}
              weeklyGoal={weeklyGoal}
              onWeeklyGoalChange={setWeeklyGoal}
              onAddWorkoutClick={() => navigate('/workouts/new')}
            />
          }
        />

        <Route
          path="/workouts"
          element={
            <WorkoutsPage
              workouts={workouts}
              onBack={() => navigate('/')}
              onAddWorkoutClick={() => navigate('/workouts/new')}
              onEditWorkout={(workoutId) =>
                navigate(`/workouts/${workoutId}/edit`)
              }
              onDeleteWorkout={handleDeleteWorkout}
            />
          }
        />

        <Route
          path="/workouts/new"
          element={
            <NewWorkoutPage
              onSubmit={handleAddWorkout}
              onCancel={() => navigate('/')}
            />
          }
        />

        <Route
          path="/workouts/:workoutId/edit"
          element={
            <EditWorkoutRoute
              workouts={workouts}
              onSubmit={handleEditWorkout}
              onCancel={() => navigate('/workouts')}
            />
          }
        />

        <Route
          path="/progress"
          element={
            <ProgressPage
              workouts={workouts}
              onBack={() => navigate('/')}
            />
          }
        />

        <Route
          path="/body"
          element={
            <BodyPage
              workouts={workouts}
              profile={healthProfile}
              onProfileChange={setHealthProfile}
              onBack={() => navigate('/')}
            />
          }
        />
        <Route
  path="/planning"
  element={
    <PlanningPage
      plannedWorkouts={plannedWorkouts}
      onAddPlannedWorkout={handleAddPlannedWorkout}
      onDeletePlannedWorkout={handleDeletePlannedWorkout}
      onCompletePlannedWorkout={handleCompletePlannedWorkout}
    />
  }
/>
<Route
  path="/challenges"
  element={
    <ChallengesPage
      workouts={workouts}
      plannedWorkouts={plannedWorkouts}
      weeklyGoal={weeklyGoal}
    />
  }
/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

type EditWorkoutRouteProps = {
  workouts: Workout[]
  onSubmit: (workoutId: string, values: WorkoutFormValues) => void
  onCancel: () => void
}

function EditWorkoutRoute({
  workouts,
  onSubmit,
  onCancel,
}: EditWorkoutRouteProps) {
  const { workoutId } = useParams()

  const workout = workouts.find((item) => item.id === workoutId)

  if (!workout) {
    return (
      <main className="min-h-screen bg-[#050816] text-slate-50">
        <section className="mx-auto max-w-5xl px-6 py-10">
          <button
            onClick={onCancel}
            className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
          >
            ← Retour aux entraînements
          </button>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-5xl">🔎</p>
            <h1 className="mt-4 text-3xl font-black">
              Séance introuvable.
            </h1>
            <p className="mt-2 text-slate-400">
              Cette séance a peut-être été supprimée.
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <EditWorkoutPage
      workout={workout}
      onSubmit={(values) => onSubmit(workout.id, values)}
      onCancel={onCancel}
    />
  )
}

export default App