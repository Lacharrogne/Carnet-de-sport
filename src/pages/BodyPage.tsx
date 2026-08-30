import { useMemo, useState, type ChangeEvent } from 'react'

import Button from '../components/ui/Button'
import HealthyRecipeSection from '../components/HealthyRecipeSection'
import TrendLineChart from '../components/charts/TrendLineChart'
import BodyMeasurements from '../components/BodyMeasurements'
import {
  getCalorieTarget,
  getTotalCalories,
} from '../services/caloriesService'
import type { BodyWeightEntry } from '../types/bodyWeight'
import type { ActivityLevel, FitnessGoal, HealthProfile } from '../types/health'
import type { Workout } from '../types/workout'

type BodyPageProps = {
  workouts: Workout[]
  profile: HealthProfile
  onProfileChange: (profile: HealthProfile) => void
  weightEntries: BodyWeightEntry[]
  onAddWeightEntry: (entry: BodyWeightEntry) => void
  onDeleteWeightEntry: (entryId: string) => void
  onBack: () => void
}

const goalLabels: Record<FitnessGoal, string> = {
  'perte-de-poids': 'Perte de poids',
  'prise-de-muscle': 'Prise de muscle',
  endurance: 'Endurance',
  'bien-etre': 'Bien-être',
  performance: 'Performance',
}

const activityLabels: Record<ActivityLevel, string> = {
  sedentaire: 'Sédentaire',
  leger: 'Activité légère',
  modere: 'Activité modérée',
  actif: 'Actif',
  'tres-actif': 'Très actif',
}

const cardioCategories = ['course', 'natation', 'football', 'velo', 'marche']

export default function BodyPage({
  workouts,
  profile,
  onProfileChange,
  weightEntries,
  onAddWeightEntry,
  onDeleteWeightEntry,
  onBack,
}: BodyPageProps) {
  const bmi = useMemo(() => {
    if (profile.height <= 0 || profile.weight <= 0) {
      return 0
    }

    const heightInMeters = profile.height / 100

    return Number(
      (profile.weight / (heightInMeters * heightInMeters)).toFixed(1),
    )
  }, [profile.height, profile.weight])

  const bodyStats = useMemo(() => {
    const strengthWorkouts = workouts.filter((workout) => {
      return workout.category === 'musculation'
    }).length

    const cardioWorkouts = workouts.filter((workout) => {
      return cardioCategories.includes(workout.category)
    }).length

const mobilityCategories: Workout['category'][] = ['yoga', 'hiit']

const mobilityWorkouts = workouts.filter((workout) => {
  return mobilityCategories.includes(workout.category)
}).length

    const totalDuration = workouts.reduce((total, workout) => {
      return total + workout.duration
    }, 0)

    const activePillars = [
      strengthWorkouts,
      cardioWorkouts,
      mobilityWorkouts,
    ].filter((value) => value > 0).length

    const balanceScore = Math.round((activePillars / 3) * 100)

    return {
      strengthWorkouts,
      cardioWorkouts,
      mobilityWorkouts,
      totalDuration,
      balanceScore,
      strengthLevel: Math.max(1, strengthWorkouts + 1),
      cardioLevel: Math.max(1, Math.floor(cardioWorkouts / 2) + 1),
      mobilityLevel: Math.max(1, mobilityWorkouts + 1),
    }
  }, [workouts])

  const bmiLabel = getBmiLabel(bmi)
  const estimatedMetabolism = getEstimatedMetabolism(profile)

  const energy = useMemo(() => {
    const target = getCalorieTarget(profile)
    const totalBurned = getTotalCalories(workouts, profile.weight)
    const averageBurned =
      workouts.length > 0 ? Math.round(totalBurned / workouts.length) : 0

    return { ...target, totalBurned, averageBurned }
  }, [profile, workouts])

  const updateProfileField = <Key extends keyof HealthProfile>(
    key: Key,
    value: HealthProfile[Key],
  ) => {
    onProfileChange({
      ...profile,
      [key]: value,
    })
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-slate-50">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="secondary" size="lg" onClick={onBack} className="mb-6">
          ← Retour au dashboard
        </Button>

        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-azur-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div>
              <p className="inline-flex rounded-full border border-azur-400/30 bg-azur-400/10 px-4 py-2 text-sm font-bold text-azur-300">
                Mon corps
              </p>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Visualise ton corps comme un personnage.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Suis tes informations physiques, tes zones travaillées et ton objectif principal. Les données restent indicatives et ne remplacent pas un avis médical.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MiniStatCard
                  label="Objectif"
                  value={goalLabels[profile.goal]}
                />

                <MiniStatCard
                  label="Activité"
                  value={activityLabels[profile.activityLevel]}
                />

                <MiniStatCard
                  label="Équilibre"
                  value={`${bodyStats.balanceScore}%`}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-azur-400/20 bg-azur-400/10 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-azur-300">
                Profil actuel
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <HeroMetric label="Taille" value={`${profile.height} cm`} />
                <HeroMetric label="Poids" value={`${profile.weight} kg`} />
                <HeroMetric label="IMC" value={bmi.toString()} />
                <HeroMetric
                  label="Dépense estimée"
                  value={`${estimatedMetabolism} kcal`}
                />
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-300">
                Le but est de transformer tes données en repères motivants, pas en pression.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-azur-300">
                Énergie
              </p>

              <h2 className="mt-2 text-3xl font-black text-white">
                Tes calories, au clair.
              </h2>
            </div>

            <div className="rounded-3xl border border-azur-400/20 bg-azur-400/10 px-5 py-4">
              <p className="text-sm text-azur-300">Stratégie</p>
              <p className="mt-1 text-2xl font-black text-white">
                {energy.label}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <EnergyCard
              label="Maintien (TDEE)"
              value={`${formatNumber(energy.maintenance)} kcal`}
              description="Dépense quotidienne totale estimée."
              icon="⚖️"
            />

            <EnergyCard
              label="Cible conseillée"
              value={`${formatNumber(energy.target)} kcal`}
              description={
                energy.delta === 0
                  ? 'Autour du maintien pour ton objectif.'
                  : `${energy.delta > 0 ? '+' : ''}${formatNumber(
                      energy.delta,
                    )} kcal/jour vs maintien.`
              }
              icon="🎯"
              accent
            />

            <EnergyCard
              label="Brûlé par le sport"
              value={
                energy.totalBurned > 0
                  ? `${formatNumber(energy.totalBurned)} kcal`
                  : '—'
              }
              description="Cumul estimé sur toutes tes séances."
              icon="🔥"
            />

            <EnergyCard
              label="Moyenne / séance"
              value={
                energy.averageBurned > 0
                  ? `${formatNumber(energy.averageBurned)} kcal`
                  : '—'
              }
              description="Dépense moyenne par entraînement."
              icon="📊"
            />
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-400">
            Estimations calculées à partir de ton poids, de la durée et de
            l’intensité de tes séances (méthode MET). Elles restent indicatives
            et ne remplacent pas un suivi nutritionnel personnalisé.
          </p>
        </section>

        <WeightTrackingSection
          entries={weightEntries}
          goalWeight={profile.goalWeight}
          onGoalWeightChange={(value) =>
            updateProfileField('goalWeight', value)
          }
          onAddEntry={onAddWeightEntry}
          onDeleteEntry={onDeleteWeightEntry}
        />

        <BodyMeasurements />

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-azur-300">
                  Avatar corporel
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Tes zones actives.
                </h2>
              </div>

              <div className="rounded-3xl border border-azur-400/20 bg-azur-400/10 px-5 py-4">
                <p className="text-sm text-azur-300">
                  Score d’équilibre
                </p>

                <p className="mt-1 text-2xl font-black text-white">
                  {bodyStats.balanceScore}%
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="relative flex h-[440px] w-[290px] items-center justify-center rounded-[3rem] border border-azur-400/20 bg-gradient-to-b from-azur-400/10 via-white/[0.03] to-sky-400/10 shadow-2xl shadow-azur-400/10 sm:w-[330px]">
                <div className="absolute inset-8 rounded-full border border-white/5" />
                <div className="absolute inset-14 rounded-full border border-white/5" />

                <BodyPart
                  className="absolute top-10 h-20 w-20 rounded-full"
                  active={workouts.length > 0}
                />

                <BodyPart
                  className="absolute top-32 h-36 w-28 rounded-[3rem]"
                  active={bodyStats.strengthWorkouts > 0}
                />

                <BodyPart
                  className="absolute left-[68px] top-36 h-32 w-9 rotate-12 rounded-full sm:left-[88px]"
                  active={bodyStats.strengthWorkouts > 0}
                />

                <BodyPart
                  className="absolute right-[68px] top-36 h-32 w-9 -rotate-12 rounded-full sm:right-[88px]"
                  active={bodyStats.strengthWorkouts > 0}
                />

                <BodyPart
                  className="absolute bottom-16 left-[104px] h-36 w-10 rounded-full sm:left-[124px]"
                  active={bodyStats.cardioWorkouts > 0}
                />

                <BodyPart
                  className="absolute bottom-16 right-[104px] h-36 w-10 rounded-full sm:right-[124px]"
                  active={bodyStats.cardioWorkouts > 0}
                />

                <FloatingStat
                  position="right-[-16px] top-20 sm:right-[-28px]"
                  label="Force"
                  value={`Niv. ${bodyStats.strengthLevel}`}
                  color="azur"
                />

                <FloatingStat
                  position="left-[-16px] bottom-28 sm:left-[-28px]"
                  label="Cardio"
                  value={`Niv. ${bodyStats.cardioLevel}`}
                  color="sky"
                />

                <FloatingStat
                  position="right-[-12px] bottom-12 sm:right-[-22px]"
                  label="Mobilité"
                  value={`Niv. ${bodyStats.mobilityLevel}`}
                  color="violet"
                />
              </div>
            </div>

            <p className="mt-8 text-center text-sm leading-6 text-slate-300">
              Les zones s’activent selon tes séances : musculation pour la force, cardio pour l’endurance, mobilité pour la récupération.
            </p>
          </section>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-azur-300">
                Mes informations
              </p>

              <h2 className="mt-2 text-3xl font-black text-white">
                Ton profil de base.
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <NumberField
                  label="Taille en cm"
                  value={profile.height}
                  min={1}
                  step={1}
                  onChange={(value) => updateProfileField('height', value)}
                />

                <NumberField
                  label="Poids en kg"
                  value={profile.weight}
                  min={1}
                  step={0.1}
                  onChange={(value) => updateProfileField('weight', value)}
                />

                <NumberField
                  label="Âge"
                  value={profile.age}
                  min={1}
                  step={1}
                  onChange={(value) => updateProfileField('age', value)}
                />

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-200">
                    Niveau d’activité
                  </span>

                  <select
                    value={profile.activityLevel}
                    onChange={(event) =>
                      updateProfileField(
                        'activityLevel',
                        event.target.value as ActivityLevel,
                      )
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
                  >
                    {Object.entries(activityLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-5 block space-y-2">
                <span className="text-sm font-bold text-slate-200">
                  Objectif principal
                </span>

                <select
                  value={profile.goal}
                  onChange={(event) =>
                    updateProfileField(
                      'goal',
                      event.target.value as FitnessGoal,
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
                >
                  {Object.entries(goalLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-azur-300">
                Analyse corporelle
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoCard
                  title="IMC indicatif"
                  value={`${bmi} — ${bmiLabel}`}
                  description="Un repère général, à interpréter avec prudence."
                />

                <InfoCard
                  title="Activité totale"
                  value={`${bodyStats.totalDuration} min`}
                  description="Temps total enregistré dans tes séances."
                />

                <InfoCard
                  title="Force"
                  value={`${bodyStats.strengthWorkouts} séance${
                    bodyStats.strengthWorkouts > 1 ? 's' : ''
                  }`}
                  description="Principalement lié aux séances de musculation."
                />

                <InfoCard
                  title="Cardio"
                  value={`${bodyStats.cardioWorkouts} séance${
                    bodyStats.cardioWorkouts > 1 ? 's' : ''
                  }`}
                  description="Course, foot, vélo, natation ou marche."
                />
              </div>

              <div className="mt-6 rounded-3xl border border-azur-400/10 bg-azur-400/5 p-5">
                <p className="font-black text-white">
                  Suggestion automatique
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {getBodySuggestion(
                    bodyStats.strengthWorkouts,
                    bodyStats.cardioWorkouts,
                    bodyStats.mobilityWorkouts,
                  )}
                </p>
              </div>

              <div className="mt-4 rounded-3xl border border-sky-400/10 bg-sky-400/5 p-5">
                <p className="font-black text-white">
                  Objectif nutrition
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {getGoalSuggestion(profile.goal)}
                </p>
              </div>
            </section>
          </div>
        </section>

        <HealthyRecipeSection profile={profile} />
      </section>
    </main>
  )
}

function WeightTrackingSection({
  entries,
  goalWeight,
  onGoalWeightChange,
  onAddEntry,
  onDeleteEntry,
}: {
  entries: BodyWeightEntry[]
  goalWeight: number
  onGoalWeightChange: (value: number) => void
  onAddEntry: (entry: BodyWeightEntry) => void
  onDeleteEntry: (entryId: string) => void
}) {
  const [date, setDate] = useState(() => getTodayKey())
  const [weightInput, setWeightInput] = useState('')

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0] ?? null
  const last = sorted[sorted.length - 1] ?? null
  const totalDelta = first && last ? last.weight - first.weight : 0

  const chartPoints = sorted.map((entry) => ({
    label: formatShortDate(entry.date),
    fullLabel: formatLongDate(entry.date),
    value: entry.weight,
  }))

  const projection = getWeightProjection(sorted, goalWeight)

  const handleAdd = () => {
    const parsed = Number(weightInput.replace(',', '.'))

    if (!date || Number.isNaN(parsed) || parsed <= 0) {
      return
    }

    onAddEntry({
      id: `w-${date}`,
      date,
      weight: Math.round(parsed * 10) / 10,
    })

    setWeightInput('')
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-azur-300">
            Suivi du poids
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            Ton évolution, semaine après semaine.
          </h2>
        </div>

        {last ? (
          <div className="rounded-3xl border border-azur-400/20 bg-azur-400/10 px-5 py-4 text-right">
            <p className="text-sm text-azur-300">Poids actuel</p>
            <p className="mt-1 text-2xl font-black text-white">
              {formatWeight(last.weight)} kg
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div>
          {chartPoints.length >= 2 ? (
            <>
              <TrendLineChart
                data={chartPoints}
                formatValue={(value) => `${formatWeight(value)} kg`}
                yBaseline="auto"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <WeightBadge
                  label="Depuis le début"
                  value={`${totalDelta > 0 ? '+' : ''}${formatWeight(
                    totalDelta,
                  )} kg`}
                  positive={totalDelta <= 0}
                />

                {goalWeight > 0 && last ? (
                  <WeightBadge
                    label="Reste vers l’objectif"
                    value={`${formatWeight(
                      Math.abs(last.weight - goalWeight),
                    )} kg`}
                    neutral
                  />
                ) : null}
              </div>

              {projection ? (
                <div className="mt-4 rounded-3xl border border-azur-400/10 bg-azur-400/5 p-5">
                  <p className="font-black text-white">Projection</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {projection}
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/50 p-6 text-center text-sm text-slate-400">
              Ajoute au moins deux pesées pour voir ta courbe d’évolution.
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm font-black text-white">Ajouter une pesée</p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold text-slate-400">Date</span>
                <input
                  type="date"
                  value={date}
                  max={getTodayKey()}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold text-slate-400">
                  Poids (kg)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  min={1}
                  value={weightInput}
                  placeholder="Ex : 72,3"
                  onChange={(event) => setWeightInput(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
                />
              </label>
            </div>

            <Button size="lg" fullWidth onClick={handleAdd} className="mt-4">
              Enregistrer la pesée
            </Button>
          </div>

          <label className="block rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <span className="text-sm font-black text-white">Poids cible</span>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                inputMode="decimal"
                step={0.1}
                min={0}
                value={goalWeight > 0 ? String(goalWeight) : ''}
                placeholder="Ex : 68"
                onChange={(event) => {
                  const parsed = Number(event.target.value.replace(',', '.'))
                  onGoalWeightChange(Number.isNaN(parsed) ? 0 : parsed)
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
              />
              <span className="text-sm font-bold text-slate-400">kg</span>
            </div>
          </label>

          {sorted.length > 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm font-black text-white">Dernières pesées</p>

              <ul className="mt-3 space-y-2">
                {[...sorted]
                  .reverse()
                  .slice(0, 5)
                  .map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-2.5"
                    >
                      <span className="text-sm font-bold text-slate-300">
                        {formatLongDate(entry.date)}
                      </span>

                      <span className="flex items-center gap-3">
                        <span className="text-sm font-black text-white">
                          {formatWeight(entry.weight)} kg
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteEntry(entry.id)}
                          className="text-xs font-black text-red-300/80 transition hover:text-red-300"
                          aria-label="Supprimer la pesée"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function WeightBadge({
  label,
  value,
  positive = false,
  neutral = false,
}: {
  label: string
  value: string
  positive?: boolean
  neutral?: boolean
}) {
  const className = neutral
    ? 'border-white/10 bg-white/5 text-slate-200'
    : positive
      ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
      : 'border-amber-400/25 bg-amber-400/10 text-amber-300'

  return (
    <span
      className={`rounded-full border px-4 py-2 text-sm font-black ${className}`}
    >
      {label} : {value}
    </span>
  )
}

/** Texte de projection vers l'objectif à partir du rythme observé. */
function getWeightProjection(
  entries: BodyWeightEntry[],
  goalWeight: number,
): string | null {
  if (entries.length < 2 || goalWeight <= 0) {
    return null
  }

  const first = entries[0]
  const last = entries[entries.length - 1]
  const remaining = last.weight - goalWeight

  if (Math.abs(remaining) < 0.2) {
    return 'Objectif de poids atteint. Bravo, à toi de le stabiliser 💪'
  }

  const daysBetween =
    (new Date(`${last.date}T00:00:00`).getTime() -
      new Date(`${first.date}T00:00:00`).getTime()) /
    86_400_000

  if (daysBetween <= 0) {
    return null
  }

  const weeklyChange = ((last.weight - first.weight) / daysBetween) * 7

  const needsToLose = remaining > 0
  const goingRightWay = needsToLose ? weeklyChange < -0.05 : weeklyChange > 0.05

  if (!goingRightWay) {
    return needsToLose
      ? 'Ton rythme actuel ne descend pas vers ton objectif. Un léger déficit calorique et de la régularité aideront.'
      : 'Ton rythme actuel ne monte pas vers ton objectif. Un léger surplus calorique et du renforcement aideront.'
  }

  const weeks = Math.abs(remaining / weeklyChange)
  const targetDate = new Date(`${last.date}T00:00:00`)
  targetDate.setDate(targetDate.getDate() + Math.round(weeks * 7))

  const roundedWeeks = Math.max(1, Math.round(weeks))

  return `À ce rythme (~${formatWeight(Math.abs(weeklyChange))} kg/semaine), objectif atteint dans ~${roundedWeeks} semaine${
    roundedWeeks > 1 ? 's' : ''
  } (vers le ${formatLongDate(getDateKey(targetDate))}).`
}

function getTodayKey() {
  return getDateKey(new Date())
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${date}T00:00:00`))
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatWeight(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 1,
  }).format(value)
}

function getBmiLabel(bmi: number) {
  if (bmi <= 0) return 'Non renseigné'
  if (bmi < 18.5) return 'Bas'
  if (bmi < 25) return 'Standard'
  if (bmi < 30) return 'Élevé'

  return 'Très élevé'
}

function getEstimatedMetabolism(profile: HealthProfile) {
  const height = Math.max(profile.height, 1)
  const weight = Math.max(profile.weight, 1)
  const age = Math.max(profile.age, 1)

  const base = 10 * weight + 6.25 * height - 5 * age + 5

  const multiplierByActivity: Record<ActivityLevel, number> = {
    sedentaire: 1.2,
    leger: 1.375,
    modere: 1.55,
    actif: 1.725,
    'tres-actif': 1.9,
  }

  return Math.round(base * multiplierByActivity[profile.activityLevel])
}

function getBodySuggestion(
  strengthWorkouts: number,
  cardioWorkouts: number,
  mobilityWorkouts: number,
) {
  if (strengthWorkouts === 0 && cardioWorkouts === 0) {
    return 'Commence par une petite séance simple : 20 minutes de marche, de mobilité ou de musculation légère.'
  }

  if (strengthWorkouts > cardioWorkouts + 2) {
    return 'Tu travailles beaucoup la force. Ajoute une séance cardio courte pour mieux équilibrer ton profil.'
  }

  if (cardioWorkouts > strengthWorkouts + 2) {
    return 'Ton cardio est bien présent. Tu pourrais ajouter une séance de renforcement pour équilibrer ton corps.'
  }

  if (mobilityWorkouts === 0) {
    return 'Tu n’as pas encore de séance mobilité. Une courte séance d’étirements pourrait améliorer ta récupération.'
  }

  return 'Ton profil est assez équilibré. Continue à varier les séances pour progresser sans te lasser.'
}

function getGoalSuggestion(goal: FitnessGoal) {
  if (goal === 'perte-de-poids') {
    return 'Privilégie des recettes rassasiantes, riches en protéines et en légumes, tout en gardant du plaisir dans l’assiette.'
  }

  if (goal === 'prise-de-muscle') {
    return 'Pense à des repas plus riches en protéines et en glucides de qualité pour soutenir la récupération et la progression.'
  }

  if (goal === 'endurance') {
    return 'Mise sur des repas digestes, avec de bons glucides, pour garder de l’énergie sur les séances longues.'
  }

  if (goal === 'performance') {
    return 'L’objectif est de mieux organiser énergie, récupération et régularité autour de tes entraînements.'
  }

  return 'Cherche surtout une alimentation simple, régulière et agréable pour accompagner ton bien-être au quotidien.'
}

function MiniStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value)
}

type EnergyCardProps = {
  label: string
  value: string
  description: string
  icon: string
  accent?: boolean
}

function EnergyCard({
  label,
  value,
  description,
  icon,
  accent = false,
}: EnergyCardProps) {
  return (
    <div
      className={[
        'rounded-3xl border p-5',
        accent
          ? 'border-azur-400/25 bg-azur-400/10'
          : 'border-white/10 bg-slate-950/60',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        <span className="text-xl">{icon}</span>
      </div>

      <p
        className={[
          'mt-2 text-2xl font-black',
          accent ? 'text-azur-200' : 'text-white',
        ].join(' ')}
      >
        {value}
      </p>

      <p className="mt-2 text-sm leading-5 text-slate-400">{description}</p>
    </div>
  )
}

type InfoCardProps = {
  title: string
  value: string
  description: string
}

function InfoCard({ title, value, description }: InfoCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        {description}
      </p>
    </div>
  )
}

type NumberFieldProps = {
  label: string
  value: number
  min?: number
  step?: number
  onChange: (value: number) => void
}

function NumberField({
  label,
  value,
  min = 1,
  step = 1,
  onChange,
}: NumberFieldProps) {
  const [fieldState, setFieldState] = useState(() => ({
    inputValue: String(value),
    syncedValue: value,
  }))

  const inputValue =
    fieldState.syncedValue === value ? fieldState.inputValue : String(value)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value

    setFieldState({
      inputValue: nextValue,
      syncedValue: value,
    })

    if (nextValue === '') {
      return
    }

    const parsedValue = Number(nextValue)

    if (!Number.isNaN(parsedValue)) {
      onChange(parsedValue)
    }
  }

  const handleBlur = () => {
    const parsedValue = Number(inputValue)

    if (
      inputValue.trim() === '' ||
      Number.isNaN(parsedValue) ||
      parsedValue < min
    ) {
      setFieldState({
        inputValue: String(min),
        syncedValue: min,
      })

      onChange(min)
      return
    }

    setFieldState({
      inputValue: String(parsedValue),
      syncedValue: parsedValue,
    })

    onChange(parsedValue)
  }

  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-200">
        {label}
      </span>

      <input
        type="number"
        min={min}
        step={step}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-azur-400/60"
      />
    </label>
  )
}

type BodyPartProps = {
  className: string
  active: boolean
}

function BodyPart({ className, active }: BodyPartProps) {
  return (
    <div
      className={`${className} border transition ${
        active
          ? 'border-azur-300/50 bg-azur-300/25 shadow-lg shadow-azur-400/20'
          : 'border-white/20 bg-white/10'
      }`}
    />
  )
}

type FloatingStatProps = {
  position: string
  label: string
  value: string
  color: 'azur' | 'sky' | 'violet'
}

function FloatingStat({ position, label, value, color }: FloatingStatProps) {
  const colorClasses = {
    azur: 'border-azur-400/20 text-azur-300',
    sky: 'border-sky-400/20 text-sky-300',
    violet: 'border-violet-400/20 text-violet-300',
  }

  return (
    <div
      className={`absolute ${position} rounded-2xl border bg-slate-950/95 px-4 py-3 shadow-2xl shadow-black/30 ${colorClasses[color]}`}
    >
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  )
}