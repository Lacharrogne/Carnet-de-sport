import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
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
import InstallPrompt from './components/InstallPrompt'
import DialogProvider from './components/ui/DialogProvider'
import { useDialogs } from './context/dialogContext'
import DemoModeBanner from './components/DemoModeBanner'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/Footer'
import SubscriptionGate from './components/SubscriptionGate'
import TrialBanner from './components/TrialBanner'
import { BodyWeightContext } from './context/bodyWeightContext'
import { useEntitlement } from './hooks/useEntitlement'
import { ENFORCE_TRIAL } from './config/subscription'
import { WORKOUTS } from './data/workouts'

import AuthPage from './pages/AuthPage'
import BodyPage from './pages/BodyPage'
import TemplatesPage from './pages/TemplatesPage'
import ChallengesPage from './pages/ChallengesPage'
import DashboardPage from './pages/DashboardPage'
import EditWorkoutPage from './pages/EditWorkoutPage'
import NewWorkoutPage from './pages/NewWorkoutPage'
import PlanningPage from './pages/PlanningPage'
import ProgressPage from './pages/ProgressPage'
import WorkoutDetailPage from './pages/WorkoutDetailPage'
import WorkoutsPage from './pages/WorkoutsPage'
import ProfilePage from './pages/ProfilePage'
import ToolsPage from './pages/ToolsPage'

import {
  getCurrentSession,
  listenToAuthChanges,
  signOut,
} from './services/authService'
import { supabase } from './services/supabaseClient'

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

import {
  deleteRemoteBodyWeightEntry,
  getRemoteBodyWeightEntries,
  saveRemoteBodyWeightEntry,
} from './services/bodyWeightStorage'

import {
  deleteRemoteWorkoutTemplate,
  getRemoteWorkoutTemplates,
  saveRemoteWorkoutTemplate,
} from './services/workoutTemplateStorage'

import { DEMO_BODY_WEIGHT_ENTRIES } from './data/bodyWeightEntries'
import { DEMO_WORKOUT_TEMPLATES } from './data/workoutTemplates'

import type { BodyWeightEntry } from './types/bodyWeight'
import type { HealthProfile } from './types/health'
import type { PlannedWorkout } from './types/plannedWorkout'
import type { WeeklyGoal } from './types/weeklyGoal'
import type { Workout, WorkoutFormValues } from './types/workout'
import type { WorkoutTemplate } from './types/workoutTemplate'

function App() {
  return (
    <BrowserRouter>
      <DialogProvider>
        <AppShell />
      </DialogProvider>
    </BrowserRouter>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { confirm, alert: showAlert } = useDialogs()

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  }, [location.pathname, location.search])

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
  const [bodyWeightEntries, setBodyWeightEntries] = useState<BodyWeightEntry[]>(
    DEMO_BODY_WEIGHT_ENTRIES,
  )
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(
    DEMO_WORKOUT_TEMPLATES,
  )

  const resetDemoData = useCallback(() => {
    setWorkouts(WORKOUTS)
    setPlannedWorkouts([])
    setWeeklyGoal(DEFAULT_WEEKLY_GOAL)
    setHealthProfile(DEFAULT_HEALTH_PROFILE)
    setBodyWeightEntries(DEMO_BODY_WEIGHT_ENTRIES)
    setTemplates(DEMO_WORKOUT_TEMPLATES)
    setHasLoadedRemoteData(false)
    setSyncError('')
  }, [])

  const handleSignOut = async () => {
    await signOut()

    setUser(null)
    resetDemoData()
    navigate('/auth')
  }

  const handleRetrySync = () => {
    setHasLoadedRemoteData(false)
    setSyncError('')
    setSyncRetryKey((currentValue) => currentValue + 1)
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
      .catch((error) => {
        console.error('Erreur récupération session Supabase :', error)

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
      // Chargement résilient : une panne passagère (jeton expiré après un
      // moment d'inactivité, micro-coupure réseau) ne doit pas bloquer toute
      // l'app. On réessaie quelques fois en rafraîchissant la session.
      const maxAttempts = 3

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          // Dès le 2e essai, on force un rafraîchissement du jeton d'accès.
          if (attempt > 1) {
            await supabase.auth.getSession()
          }

          const [
            remoteWorkouts,
            remotePlannedWorkouts,
            remoteWeeklyGoal,
            remoteHealthProfile,
            remoteBodyWeightEntries,
            remoteTemplates,
          ] = await Promise.all([
            getRemoteWorkouts(userId),
            getRemotePlannedWorkouts(userId),
            getRemoteWeeklyGoal(userId),
            getRemoteHealthProfile(userId),
            // Tolérant : si la table n'existe pas encore (migration non lancée),
            // on démarre avec un historique vide plutôt que de bloquer l'app.
            getRemoteBodyWeightEntries(userId).catch(() => []),
            getRemoteWorkoutTemplates(userId).catch(() => []),
          ])

          if (!isMounted) {
            return
          }

          setWorkouts(remoteWorkouts)
          setPlannedWorkouts(remotePlannedWorkouts)
          setWeeklyGoal(remoteWeeklyGoal ?? DEFAULT_WEEKLY_GOAL)
          setHealthProfile(remoteHealthProfile ?? DEFAULT_HEALTH_PROFILE)
          setBodyWeightEntries(remoteBodyWeightEntries)
          setTemplates(remoteTemplates)
          setHasLoadedRemoteData(true)
          setSyncError('')
          return
        } catch (error) {
          console.error(
            `Erreur lors du chargement Supabase (essai ${attempt}/${maxAttempts}) :`,
            error,
          )

          if (!isMounted) {
            return
          }

          if (attempt < maxAttempts) {
            // Backoff court avant de retenter.
            await new Promise((resolve) => setTimeout(resolve, attempt * 1200))
            continue
          }

          setSyncError(
            'Impossible de charger les données Supabase pour le moment.',
          )
        }
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

    void saveRemoteWeeklyGoal(weeklyGoal, user.id).catch((error) => {
      console.error('Erreur synchronisation objectif hebdomadaire :', error)
    })
  }, [weeklyGoal, user, hasLoadedRemoteData])

  useEffect(() => {
    if (!user || !hasLoadedRemoteData) {
      return
    }

    void saveRemoteHealthProfile(healthProfile, user.id).catch((error) => {
      console.error('Erreur synchronisation profil santé :', error)
    })
  }, [healthProfile, user, hasLoadedRemoteData])

  const saveWorkoutsSafely = async (
    nextWorkouts: Workout[],
    errorMessage: string,
  ) => {
    if (!user) {
      setWorkouts(nextWorkouts)
      return true
    }

    try {
      await saveRemoteWorkouts(nextWorkouts, user.id)
      setWorkouts(nextWorkouts)
      return true
    } catch (error) {
      console.error(errorMessage, error)

      void showAlert({ message: "La modification n'a pas pu être enregistrée. Vérifie ta connexion et réessaie dans un instant." })

      return false
    }
  }

  const savePlannedWorkoutsSafely = async (
    nextPlannedWorkouts: PlannedWorkout[],
    errorMessage: string,
  ) => {
    if (!user) {
      setPlannedWorkouts(nextPlannedWorkouts)
      return true
    }

    try {
      await saveRemotePlannedWorkouts(nextPlannedWorkouts, user.id)
      setPlannedWorkouts(nextPlannedWorkouts)
      return true
    } catch (error) {
      console.error(errorMessage, error)

      void showAlert({ message: "La modification du planning n'a pas pu être enregistrée. Vérifie ta connexion et réessaie." })

      return false
    }
  }

  const handleAddWorkout = async (values: WorkoutFormValues) => {
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      ...values,
    }

    const nextWorkouts = [newWorkout, ...workouts]

    const hasSaved = await saveWorkoutsSafely(
      nextWorkouts,
      'Erreur lors de la sauvegarde de la séance :',
    )

    if (hasSaved) {
      navigate('/workouts')
    }
  }

  const handleEditWorkout = async (
    workoutId: string,
    values: WorkoutFormValues,
  ) => {
    const nextWorkouts = workouts.map((workout) => {
      if (workout.id !== workoutId) {
        return workout
      }

      return {
        id: workout.id,
        ...values,
      }
    })

    const hasSaved = await saveWorkoutsSafely(
      nextWorkouts,
      'Erreur lors de la modification de la séance :',
    )

    if (hasSaved) {
      navigate('/workouts')
    }
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    const workoutToDelete = workouts.find((workout) => {
      return workout.id === workoutId
    })

    if (!workoutToDelete) {
      return false
    }

    const confirmed = await confirm({
      title: 'Supprimer la séance',
      message: `Voulez-vous vraiment supprimer « ${workoutToDelete.title} » ? Cette action est définitive.`,
      confirmLabel: 'Supprimer',
      tone: 'danger',
    })

    if (!confirmed) {
      return false
    }

    const nextWorkouts = workouts.filter((workout) => {
      return workout.id !== workoutId
    })

    return await saveWorkoutsSafely(
      nextWorkouts,
      'Erreur lors de la suppression de la séance :',
    )
  }

  const handleAddPlannedWorkout = async (plannedWorkout: PlannedWorkout) => {
    const nextPlannedWorkouts = [plannedWorkout, ...plannedWorkouts]

    await savePlannedWorkoutsSafely(
      nextPlannedWorkouts,
      'Erreur lors de la sauvegarde de la séance prévue :',
    )
  }

  const handleUpdatePlannedWorkout = async (
    updatedPlannedWorkout: PlannedWorkout,
  ) => {
    const nextPlannedWorkouts = plannedWorkouts.map((plannedWorkout) => {
      if (plannedWorkout.id !== updatedPlannedWorkout.id) {
        return plannedWorkout
      }

      return updatedPlannedWorkout
    })

    await savePlannedWorkoutsSafely(
      nextPlannedWorkouts,
      'Erreur lors de la modification de la séance prévue :',
    )
  }

  const handleDeletePlannedWorkout = async (plannedWorkoutId: string) => {
    const plannedWorkoutToDelete = plannedWorkouts.find((plannedWorkout) => {
      return plannedWorkout.id === plannedWorkoutId
    })

    if (!plannedWorkoutToDelete) {
      return
    }

    const confirmed = await confirm({
      title: 'Supprimer la séance prévue',
      message: `Voulez-vous vraiment retirer « ${plannedWorkoutToDelete.title} » de ton planning ?`,
      confirmLabel: 'Supprimer',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    const nextPlannedWorkouts = plannedWorkouts.filter((plannedWorkout) => {
      return plannedWorkout.id !== plannedWorkoutId
    })

    await savePlannedWorkoutsSafely(
      nextPlannedWorkouts,
      'Erreur lors de la suppression de la séance prévue :',
    )
  }

  const handleCompletePlannedWorkout = async (
    plannedWorkout: PlannedWorkout,
  ) => {
    const confirmed = await confirm({
      title: 'Marquer comme réalisée',
      message: `Ajouter « ${plannedWorkout.title} » à tes séances réalisées ?`,
      confirmLabel: 'Marquer réalisée',
    })

    if (!confirmed) {
      return
    }

    const completedWorkout: Workout = {
      id: crypto.randomUUID(),
      title: plannedWorkout.title,
      category: plannedWorkout.category,
      date: getTodayDateKey(),
      duration: plannedWorkout.duration,
      intensity: 'Moyenne',
      feeling: 'Bon',
      notes: plannedWorkout.objective
        ? `Objectif prévu : ${plannedWorkout.objective}`
        : '',
      improvementIdea: '',
      trend: 'stable',
      details: plannedWorkout.details,
    }

    const nextWorkouts = [completedWorkout, ...workouts]

    const nextPlannedWorkouts = plannedWorkouts.filter((item) => {
      return item.id !== plannedWorkout.id
    })

    if (!user) {
      setWorkouts(nextWorkouts)
      setPlannedWorkouts(nextPlannedWorkouts)
      navigate('/workouts')
      return
    }

    try {
      await Promise.all([
        saveRemoteWorkouts(nextWorkouts, user.id),
        saveRemotePlannedWorkouts(nextPlannedWorkouts, user.id),
      ])

      setWorkouts(nextWorkouts)
      setPlannedWorkouts(nextPlannedWorkouts)

      navigate('/workouts')
    } catch (error) {
      console.error(
        'Erreur lors de la validation de la séance prévue :',
        error,
      )

      void showAlert({ message: "La séance prévue n'a pas pu être validée. Vérifie ta connexion et réessaie." })
    }
  }

  const syncProfileWeightToLatest = (entries: BodyWeightEntry[]) => {
    if (entries.length === 0) {
      return
    }

    const latest = entries[entries.length - 1]

    setHealthProfile((current) =>
      current.weight === latest.weight
        ? current
        : { ...current, weight: latest.weight },
    )
  }

  const handleAddWeightEntry = async (entry: BodyWeightEntry) => {
    const mergeEntries = (saved: BodyWeightEntry) =>
      [...bodyWeightEntries.filter((item) => item.date !== saved.date), saved].sort(
        (a, b) => a.date.localeCompare(b.date),
      )

    if (!user) {
      const nextEntries = mergeEntries(entry)
      setBodyWeightEntries(nextEntries)
      syncProfileWeightToLatest(nextEntries)
      return
    }

    try {
      const saved = await saveRemoteBodyWeightEntry(entry, user.id)
      const nextEntries = mergeEntries(saved)
      setBodyWeightEntries(nextEntries)
      syncProfileWeightToLatest(nextEntries)
    } catch (error) {
      console.error('Erreur lors de l’enregistrement de la pesée :', error)

      void showAlert({ message: "La pesée n'a pas pu être enregistrée. Vérifie ta connexion et réessaie." })
    }
  }

  const handleDeleteWeightEntry = async (entryId: string) => {
    const nextEntries = bodyWeightEntries.filter((item) => item.id !== entryId)

    if (!user) {
      setBodyWeightEntries(nextEntries)
      return
    }

    try {
      await deleteRemoteBodyWeightEntry(entryId, user.id)
      setBodyWeightEntries(nextEntries)
    } catch (error) {
      console.error('Erreur lors de la suppression de la pesée :', error)

      void showAlert({ message: "La pesée n'a pas pu être supprimée. Vérifie ta connexion et réessaie." })
    }
  }

  const handleDuplicateWorkout = (workout: Workout) => {
    const initialValues: WorkoutFormValues = {
      title: workout.title ? `${workout.title} (copie)` : '',
      category: workout.category,
      date: getTodayDateKey(),
      duration: workout.duration,
      intensity: workout.intensity,
      feeling: workout.feeling,
      notes: workout.notes,
      improvementIdea: workout.improvementIdea,
      trend: 'stable',
      details: workout.details,
    }

    navigate('/workouts/new', { state: { initialValues } })
  }

  const handleStartFromTemplate = (template: WorkoutTemplate) => {
    const initialValues: WorkoutFormValues = {
      ...template.payload,
      date: getTodayDateKey(),
    }

    navigate('/workouts/new', { state: { initialValues } })
  }

  const handleSaveTemplate = async (name: string, values: WorkoutFormValues) => {
    const cleanName = name.trim()

    if (!cleanName) {
      return
    }

    const template: WorkoutTemplate = {
      id: crypto.randomUUID(),
      name: cleanName,
      category: values.category,
      payload: { ...values, date: '' },
    }

    if (!user) {
      setTemplates((current) => [template, ...current])
      return
    }

    try {
      const saved = await saveRemoteWorkoutTemplate(template, user.id)
      setTemplates((current) => [saved, ...current])
    } catch (error) {
      console.error('Erreur lors de l’enregistrement du modèle :', error)

      void showAlert({ message: "Le modèle n'a pas pu être enregistré. Vérifie ta connexion et réessaie." })
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    const nextTemplates = templates.filter((item) => item.id !== templateId)

    if (!user) {
      setTemplates(nextTemplates)
      return
    }

    try {
      await deleteRemoteWorkoutTemplate(templateId, user.id)
      setTemplates(nextTemplates)
    } catch (error) {
      console.error('Erreur lors de la suppression du modèle :', error)

      void showAlert({ message: "Le modèle n'a pas pu être supprimé. Vérifie ta connexion et réessaie." })
    }
  }

  const isLoadingRemoteData = Boolean(user && !hasLoadedRemoteData && !syncError)

  // Verrou d'abonnement par carnet (inerte tant que ENFORCE_TRIAL est false).
  const entitlement = useEntitlement(user)
  const showSubscriptionGate =
    ENFORCE_TRIAL &&
    !entitlement.loading &&
    !entitlement.hasAccess &&
    location.pathname !== '/auth'

  const shouldShowDemoBanner =
    !user && !isAuthLoading && location.pathname !== '/auth'

  return (
    <BodyWeightContext.Provider value={healthProfile.weight}>
      <AppNavigation
        user={user}
        isAuthLoading={isAuthLoading}
        onSignOut={handleSignOut}
      />

      {isAuthLoading ? (
        <main className="min-h-screen px-6 py-16 text-slate-50">
          <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
            <img
              src="/logo.png"
              alt="Carnet de sport"
              className="mx-auto h-16 w-16 object-contain"
            />

            <h1 className="mt-5 text-4xl font-black">
              Préparation de ton carnet sportif...
            </h1>

            <p className="mt-3 text-slate-400">On vérifie ta session.</p>
          </section>
        </main>
      ) : isLoadingRemoteData ? (
        <main className="min-h-screen px-6 py-16 text-slate-50">
          <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
            <img
              src="/logo.png"
              alt="Carnet de sport"
              className="mx-auto h-16 w-16 object-contain"
            />

            <h1 className="mt-5 text-4xl font-black">
              Chargement de ton carnet sportif...
            </h1>

            <p className="mt-3 text-slate-400">
              On récupère tes séances, ton planning, tes objectifs et ton profil.
            </p>
          </section>
        </main>
      ) : syncError ? (
        <main className="min-h-screen px-6 py-16 text-slate-50">
          <section className="mx-auto max-w-5xl rounded-[2rem] border border-red-400/20 bg-red-400/10 p-10 text-center">
            <p className="text-5xl">⚠️</p>

            <h1 className="mt-5 text-4xl font-black">
              Erreur de synchronisation
            </h1>

            <p className="mt-3 text-red-100">{syncError}</p>

            <button
              type="button"
              onClick={handleRetrySync}
              className="mt-6 rounded-full bg-red-300 px-6 py-3 font-black text-slate-950 transition hover:bg-red-200"
            >
              Réessayer
            </button>
          </section>
        </main>
      ) : showSubscriptionGate ? (
        <SubscriptionGate />
      ) : (
        <>
          {shouldShowDemoBanner && <DemoModeBanner />}

          {user &&
            !entitlement.loading &&
            (entitlement.status === 'trialing' ||
              entitlement.status === 'expired') &&
            location.pathname !== '/auth' && (
              <div className="mx-auto w-full max-w-[1380px] px-4 pt-4 sm:px-6 lg:px-8">
                <TrialBanner
                  status={entitlement.status}
                  daysLeft={entitlement.daysLeft}
                />
              </div>
            )}

          <ErrorBoundary resetKey={location.pathname}>
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
                  onOpenWorkout={(workoutId) => {
                    navigate(`/workouts/${workoutId}`)
                  }}
                  onEditWorkout={(workoutId) => {
                    navigate(`/workouts/${workoutId}/edit`)
                  }}
                  onDeleteWorkout={(workoutId) => {
                    void handleDeleteWorkout(workoutId)
                  }}
                  onDuplicateWorkout={handleDuplicateWorkout}
                />
              }
            />

            <Route
              path="/workouts/new"
              element={
                <NewWorkoutRoute
                  workouts={workouts}
                  onSubmit={(values) => {
                    void handleAddWorkout(values)
                  }}
                  onCancel={() => navigate('/workouts')}
                />
              }
            />

            <Route
              path="/workouts/:workoutId"
              element={
                <WorkoutDetailRoute
                  workouts={workouts}
                  onBack={() => navigate('/workouts')}
                  onEditWorkout={(workoutId) => {
                    navigate(`/workouts/${workoutId}/edit`)
                  }}
                  onDeleteWorkout={(workoutId) => {
                    void handleDeleteWorkout(workoutId).then((hasDeleted) => {
                      if (hasDeleted) {
                        navigate('/workouts')
                      }
                    })
                  }}
                  onDuplicate={handleDuplicateWorkout}
                  onSaveTemplate={(name, workout) => {
                    void handleSaveTemplate(
                      name,
                      workoutToFormValues(workout, ''),
                    )
                  }}
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
                  plannedWorkouts={plannedWorkouts}
                  weeklyGoal={weeklyGoal}
                  healthProfile={healthProfile}
                  onBack={() => navigate('/')}
                />
              }
            />

            <Route
              path="/templates"
              element={
                <TemplatesPage
                  templates={templates}
                  onBack={() => navigate('/')}
                  onCreateWorkoutClick={() => navigate('/workouts/new')}
                  onStartFromTemplate={handleStartFromTemplate}
                  onSaveTemplate={handleSaveTemplate}
                  onDeleteTemplate={(templateId) => {
                    void handleDeleteTemplate(templateId)
                  }}
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
                  weightEntries={bodyWeightEntries}
                  onAddWeightEntry={handleAddWeightEntry}
                  onDeleteWeightEntry={handleDeleteWeightEntry}
                  onBack={() => navigate('/')}
                />
              }
            />

            <Route
              path="/planning"
              element={
                <PlanningPage
                  plannedWorkouts={plannedWorkouts}
                  onAddPlannedWorkout={(plannedWorkout) => {
                    void handleAddPlannedWorkout(plannedWorkout)
                  }}
                  onUpdatePlannedWorkout={(plannedWorkout) => {
                    void handleUpdatePlannedWorkout(plannedWorkout)
                  }}
                  onDeletePlannedWorkout={(plannedWorkoutId) => {
                    void handleDeletePlannedWorkout(plannedWorkoutId)
                  }}
                  onCompletePlannedWorkout={(plannedWorkout) => {
                    void handleCompletePlannedWorkout(plannedWorkout)
                  }}
                />
              }
            />

            <Route
  path="/profile"
  element={
    <ProfilePage
      user={user}
      onUserUpdate={setUser}
      onBack={() => navigate('/')}
      workouts={workouts}
      bodyWeightEntries={bodyWeightEntries}
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

            <Route
              path="/tools"
              element={<ToolsPage onBack={() => navigate('/')} />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>

          {location.pathname !== '/auth' && <Footer />}
          {location.pathname !== '/auth' && <InstallPrompt />}
        </>
      )}
    </BodyWeightContext.Provider>
  )
}

type NewWorkoutRouteProps = {
  workouts: Workout[]
  onSubmit: (values: WorkoutFormValues) => void
  onCancel: () => void
}

function NewWorkoutRoute({ workouts, onSubmit, onCancel }: NewWorkoutRouteProps) {
  const location = useLocation()
  const initialValues = (
    location.state as { initialValues?: WorkoutFormValues } | null
  )?.initialValues

  return (
    <NewWorkoutPage
      initialValues={initialValues}
      submitLabel={initialValues ? 'Enregistrer la séance' : undefined}
      onSubmit={onSubmit}
      onCancel={onCancel}
      workouts={workouts}
    />
  )
}

type EditWorkoutRouteProps = {
  workouts: Workout[]
  onSubmit: (workoutId: string, values: WorkoutFormValues) => Promise<void>
  onCancel: () => void
}

function EditWorkoutRoute({
  workouts,
  onSubmit,
  onCancel,
}: EditWorkoutRouteProps) {
  const { workoutId } = useParams()

  const workout = workouts.find((item) => {
    return item.id === workoutId
  })

  if (!workout) {
    return (
      <main className="min-h-screen text-slate-50">
        <section className="mx-auto max-w-5xl px-6 py-10">
          <button
            type="button"
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
      workouts={workouts}
      onSubmit={(values) => {
        void onSubmit(workout.id, values)
      }}
      onCancel={onCancel}
    />
  )
}

type WorkoutDetailRouteProps = {
  workouts: Workout[]
  onBack: () => void
  onEditWorkout: (workoutId: string) => void
  onDeleteWorkout: (workoutId: string) => void
  onDuplicate: (workout: Workout) => void
  onSaveTemplate: (name: string, workout: Workout) => void
}

function WorkoutDetailRoute({
  workouts,
  onBack,
  onEditWorkout,
  onDeleteWorkout,
  onDuplicate,
  onSaveTemplate,
}: WorkoutDetailRouteProps) {
  const { workoutId } = useParams()

  const workout = workouts.find((item) => {
    return item.id === workoutId
  })

  if (!workout) {
    return (
      <main className="min-h-screen text-slate-50">
        <section className="mx-auto max-w-5xl px-6 py-10">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
          >
            ← Retour au carnet
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
    <WorkoutDetailPage
      workout={workout}
      onBack={onBack}
      onEdit={onEditWorkout}
      onDelete={onDeleteWorkout}
      onDuplicate={onDuplicate}
      onSaveTemplate={onSaveTemplate}
    />
  )
}

/** Convertit une séance existante en valeurs de formulaire (pour dupliquer). */
function workoutToFormValues(
  workout: Workout,
  date: string,
): WorkoutFormValues {
  return {
    title: workout.title,
    category: workout.category,
    date,
    duration: workout.duration,
    intensity: workout.intensity,
    feeling: workout.feeling,
    notes: workout.notes,
    improvementIdea: workout.improvementIdea,
    trend: workout.trend,
    details: workout.details,
  }
}

function getTodayDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default App