import { useMemo, useState, type ChangeEvent } from 'react'

import HealthyRecipeSection from '../components/HealthyRecipeSection'
import type { ActivityLevel, FitnessGoal, HealthProfile } from '../types/health'
import type { Workout } from '../types/workout'

type BodyPageProps = {
  workouts: Workout[]
  profile: HealthProfile
  onProfileChange: (profile: HealthProfile) => void
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

    const mobilityWorkouts = workouts.filter((workout) => {
      return workout.category === 'mobilite'
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
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-slate-50">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
        >
          ← Retour au dashboard
        </button>

        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Mon corps
              </p>

              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Visualise ton corps comme un personnage.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Suis tes informations physiques, tes zones travaillées et ton objectif principal. Les données restent indicatives et ne remplacent pas un avis médical.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
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

            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Profil actuel
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Taille" value={`${profile.height} cm`} icon="📏" />
          <StatCard label="Poids" value={`${profile.weight} kg`} icon="⚖️" />
          <StatCard
            label="IMC indicatif"
            value={`${bmi} · ${bmiLabel}`}
            icon="🧬"
          />
          <StatCard
            label="Métabolisme estimé"
            value={`${estimatedMetabolism} kcal`}
            icon="🔥"
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                  Avatar corporel
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Tes zones actives.
                </h2>
              </div>

              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
                <p className="text-sm text-emerald-300">
                  Score d’équilibre
                </p>

                <p className="mt-1 text-2xl font-black text-white">
                  {bodyStats.balanceScore}%
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="relative flex h-[440px] w-[290px] items-center justify-center rounded-[3rem] border border-emerald-400/20 bg-gradient-to-b from-emerald-400/10 via-white/[0.03] to-sky-400/10 shadow-2xl shadow-emerald-400/10 sm:w-[330px]">
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
                  color="emerald"
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
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Mes informations
              </p>

              <h2 className="mt-2 text-3xl font-black text-white">
                Ton profil de base.
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
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
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Analyse corporelle
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

              <div className="mt-6 rounded-3xl border border-emerald-400/10 bg-emerald-400/5 p-5">
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

type StatCardProps = {
  label: string
  value: string
  icon: string
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/10 transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
        </div>

        <div className="rounded-2xl bg-white/10 px-3 py-2 text-3xl">
          {icon}
        </div>
      </div>
    </article>
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
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-emerald-400/60"
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
          ? 'border-emerald-300/50 bg-emerald-300/25 shadow-lg shadow-emerald-400/20'
          : 'border-white/20 bg-white/10'
      }`}
    />
  )
}

type FloatingStatProps = {
  position: string
  label: string
  value: string
  color: 'emerald' | 'sky' | 'violet'
}

function FloatingStat({ position, label, value, color }: FloatingStatProps) {
  const colorClasses = {
    emerald: 'border-emerald-400/20 text-emerald-300',
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