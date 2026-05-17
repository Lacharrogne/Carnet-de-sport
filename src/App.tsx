import { useCallback, useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

import AppNavigation from './components/AppNavigation'
import DemoModeBanner from './components/DemoModeBanner'
import { WORKOUTS } from './data/workouts'

import AuthPage from './pages/AuthPage'
import BodyPage from './pages/BodyPage'
import ChallengesPage from './pages/ChallengesPage'
import DashboardPage from './pages/DashboardPage'
import EditWorkoutPage from './pages/EditWorkoutPage'
import NewWorkoutPage from './pages/NewWorkoutPage'
import PlanningPage from './pages/PlanningPage'
import ProgressPage from './pages/ProgressPage'
import WorkoutsPage from './pages/WorkoutsPage'

import {
  getCurrentSession,
  listenToAuthChanges,
  signOut,
} from './services/authService'

import {
  DEFAULT_HEALTH_PROFILE,
  getRemoteHealthProfile,
  saveRemoteHealthProfile,
} from './services/healthProfileStorage'

import {
  getRemotePlannedWorkouts,
  saveRemotePlannedWorkouts,
} from './services/plannedWorkoutStorage'

import {
  DEFAULT_WEEKLY_GOAL,
  getRemoteWeeklyGoal,
  saveRemoteWeeklyGoal,
} from './services/weeklyGoalStorage'

import {
  getRemoteWorkouts,
  saveRemoteWorkouts,
} from './services/workoutStorage'

import type { HealthProfile } from './types/health'
import type { PlannedWorkout } from './types/plannedWorkout'
import type { WeeklyGoal } from './types/weeklyGoal'
import type { Workout, WorkoutFormValues } from './types/workout'

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()

  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [hasLoadedRemoteData, setHasLoadedRemoteData] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [syncRetryKey, setSyncRetryKey] = useState(0)

  const [workouts, setWorkouts] = useState<Workout[]>(WORKOUTS)
  const [plannedWorkouts, setPlannedWorkouts] = useState<PlannedWorkout[]>([])
  const [weeklyGoal, setWeeklyGoal] =
    useState<WeeklyGoal>(DEFAULT_WEEKLY_GOAL)
  const [healthProfile, setHealthProfile] =
    useState<HealthProfile>(DEFAULT_HEALTH_PROFILE)

  const resetDemoData = useCallback(() => {
    setWorkouts(WORKOUTS)
    setPlannedWorkouts([])
    setWeeklyGoal(DEFAULT_WEEKLY_GOAL)
    setHealthProfile(DEFAULT_HEALTH_PROFILE)
    setHasLoadedRemoteData(false)
    setSyncError('')
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    resetDemoData()
    navigate('/auth')
  }

  useEffect(() => {
    let isMounted = true

    getCurrentSession()
      .then((session) => {
        if (!isMounted) {
          return
        }

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (!currentUser) {
          resetDemoData()
        }
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setUser(null)
        resetDemoData()
      })
      .finally(() => {
        if (!isMounted) {
          return
        }

        setIsAuthLoading(false)
      })

    const subscription = listenToAuthChanges(async (_event, session) => {
      if (!isMounted) {
        return
      }

      const nextUser = session?.user ?? null

      setUser(nextUser)
      setHasLoadedRemoteData(false)
      setSyncError('')
      setIsAuthLoading(false)

      if (!nextUser) {
        resetDemoData()
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [resetDemoData])

  useEffect(() => {
    if (!user) {
      return
    }

    const userId = user.id
    let isMounted = true

    async function loadUserData() {
      try {
        setSyncError('')

        const [
          remoteWorkouts,
          remotePlannedWorkouts,
          remoteWeeklyGoal,
          remoteHealthProfile,
        ] = await Promise.all([
          getRemoteWorkouts(userId),
          getRemotePlannedWorkouts(userId),
          getRemoteWeeklyGoal(userId),
          getRemoteHealthProfile(userId),
        ])

        if (!isMounted) {
          return
        }

        setWorkouts(remoteWorkouts)
        setPlannedWorkouts(remotePlannedWorkouts)
        setWeeklyGoal(remoteWeeklyGoal ?? DEFAULT_WEEKLY_GOAL)
        setHealthProfile(remoteHealthProfile ?? DEFAULT_HEALTH_PROFILE)
        setHasLoadedRemoteData(true)
      } catch (error) {
        console.error('Erreur lors du chargement Supabase :', error)

        if (!isMounted) {
          return
        }

        setSyncError(
          'Impossible de charger les données Supabase pour le moment.',
        )
      }
    }

    void loadUserData()

    return () => {
      isMounted = false
    }
  }, [user, syncRetryKey])

  useEffect(() => {
    if (!user || !hasLoadedRemoteData) {
      return
    }

    void saveRemoteWorkouts(workouts, user.id)
  }, [workouts, user, hasLoadedRemoteData])

  useEffect(() => {
    if (!user || !hasLoadedRemoteData) {
      return
    }

    void saveRemotePlannedWorkouts(plannedWorkouts, user.id)
  }, [plannedWorkouts, user, hasLoadedRemoteData])

  useEffect(() => {
    if (!user || !hasLoadedRemoteData) {
      return
    }

    void saveRemoteWeeklyGoal(weeklyGoal, user.id)
  }, [weeklyGoal, user, hasLoadedRemoteData])

  useEffect(() => {
    if (!user || !hasLoadedRemoteData) {
      return
    }

    void saveRemoteHealthProfile(healthProfile, user.id)
  }, [healthProfile, user, hasLoadedRemoteData])

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
      `Supprimer la séance prévue "${plannedWorkoutToDelete.title}" ?`,
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
      `Transformer "${plannedWorkout.title}" en séance réalisée ?`,
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
    values: WorkoutFormValues,
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
    const workoutToDelete = workouts.find((workout) => {
      return workout.id === workoutId
    })

    if (!workoutToDelete) {
      return
    }

    const confirmed = window.confirm(
      `Supprimer la séance "${workoutToDelete.title}" ?`,
    )

    if (!confirmed) {
      return
    }

    setWorkouts((currentWorkouts) => {
      return currentWorkouts.filter((workout) => workout.id !== workoutId)
    })
  }

  const isLoadingRemoteData = Boolean(user && !hasLoadedRemoteData && !syncError)
  const shouldShowDemoBanner = !user && !isAuthLoading && location.pathname !== '/auth'

  return (
    <>
      <AppNavigation
        user={user}
        isAuthLoading={isAuthLoading}
        onSignOut={handleSignOut}
      />

      {isAuthLoading ? (
        <main className="min-h-screen bg-[#050816] px-6 py-16 text-slate-50">
          <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-5xl">⚡</p>
            <h1 className="mt-5 text-4xl font-black">
              Préparation de ton carnet sportif...
            </h1>
            <p className="mt-3 text-slate-400">
              On vérifie ta session.
            </p>
          </section>
        </main>
      ) : isLoadingRemoteData ? (
        <main className="min-h-screen bg-[#050816] px-6 py-16 text-slate-50">
          <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-5xl">⚡</p>
            <h1 className="mt-5 text-4xl font-black">
              Chargement de ton carnet sportif...
            </h1>
            <p className="mt-3 text-slate-400">
              On récupère tes séances, ton planning, tes objectifs et ton profil.
            </p>
          </section>
        </main>
      ) : syncError ? (
        <main className="min-h-screen bg-[#050816] px-6 py-16 text-slate-50">
          <section className="mx-auto max-w-5xl rounded-[2rem] border border-red-400/20 bg-red-400/10 p-10 text-center">
            <p className="text-5xl">⚠️</p>
            <h1 className="mt-5 text-4xl font-black">
              Erreur de synchronisation
            </h1>
            <p className="mt-3 text-red-100">{syncError}</p>

            <button
              type="button"
              onClick={() => {
                setHasLoadedRemoteData(false)
                setSyncError('')
                setSyncRetryKey((currentValue) => currentValue + 1)
              }}
              className="mt-6 rounded-full bg-red-300 px-6 py-3 font-black text-slate-950 transition hover:bg-red-200"
            >
              Réessayer
            </button>
          </section>
        </main>
      ) : (
        <>
          {shouldShowDemoBanner && <DemoModeBanner />}

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

            <Route path="/auth" element={<AuthPage />} />

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
      )}
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