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
    const upperBodyWorkouts = workouts.filter((workout) => {
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

    return {
      upperBodyWorkouts,
      cardioWorkouts,
      mobilityWorkouts,
      totalDuration,
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
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
        >
          ← Retour au dashboard
        </button>

        <header className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Mon corps
              </p>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                Visualise ton corps comme un personnage.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Suis tes informations physiques, tes zones travaillées et ton
                objectif principal. Les données restent indicatives et ne
                remplacent pas un avis médical.
              </p>
            </div>

            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Objectif actuel
              </p>

              <p className="mt-4 text-3xl font-black text-white">
                {goalLabels[profile.goal]}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Le but est de transformer tes données en repères motivants, pas
                en pression.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Taille" value={`${profile.height} cm`} icon="📏" />
          <StatCard label="Poids" value={`${profile.weight} kg`} icon="⚖️" />
          <StatCard label="IMC indicatif" value={bmi.toString()} icon="🧬" />
          <StatCard
            label="Métabolisme estimé"
            value={`${estimatedMetabolism} kcal`}
            icon="🔥"
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
              Représentation du corps
            </p>

            <div className="mt-8 flex justify-center">
              <div className="relative flex h-[420px] w-[280px] items-center justify-center rounded-[3rem] border border-emerald-400/20 bg-emerald-400/5 shadow-2xl shadow-emerald-400/10">
                <BodyPart
                  className="absolute top-10 h-20 w-20 rounded-full"
                  active={workouts.length > 0}
                />

                <BodyPart
                  className="absolute top-32 h-36 w-28 rounded-[3rem]"
                  active={bodyStats.upperBodyWorkouts > 0}
                />

                <BodyPart
                  className="absolute left-14 top-36 h-32 w-9 rotate-12 rounded-full"
                  active={bodyStats.upperBodyWorkouts > 0}
                />

                <BodyPart
                  className="absolute right-14 top-36 h-32 w-9 -rotate-12 rounded-full"
                  active={bodyStats.upperBodyWorkouts > 0}
                />

                <BodyPart
                  className="absolute bottom-14 left-[104px] h-36 w-10 rounded-full"
                  active={bodyStats.cardioWorkouts > 0}
                />

                <BodyPart
                  className="absolute bottom-14 right-[104px] h-36 w-10 rounded-full"
                  active={bodyStats.cardioWorkouts > 0}
                />

                <FloatingStat
                  position="right-[-30px] top-20"
                  label="Force"
                  value={`Niv. ${Math.max(1, bodyStats.upperBodyWorkouts + 1)}`}
                  color="emerald"
                />

                <FloatingStat
                  position="left-[-30px] bottom-24"
                  label="Cardio"
                  value={`Niv. ${Math.max(
                    1,
                    Math.floor(bodyStats.cardioWorkouts / 2) + 1,
                  )}`}
                  color="sky"
                />

                <FloatingStat
                  position="right-[-20px] bottom-10"
                  label="Mobilité"
                  value={`Niv. ${Math.max(1, bodyStats.mobilityWorkouts + 1)}`}
                  color="violet"
                />
              </div>
            </div>

            <p className="mt-8 text-center text-sm leading-6 text-slate-300">
              Les zones s’activent selon tes séances : musculation pour le haut
              du corps, cardio pour les jambes et l’endurance, mobilité pour la
              récupération.
            </p>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
                Mes informations
              </p>

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
                    updateProfileField('goal', event.target.value as FitnessGoal)
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

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
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
                  value={`${bodyStats.upperBodyWorkouts} séance(s)`}
                  description="Principalement lié aux séances de musculation."
                />

                <InfoCard
                  title="Cardio"
                  value={`${bodyStats.cardioWorkouts} séance(s)`}
                  description="Course, foot, vélo, natation ou marche."
                />
              </div>

              <div className="mt-6 rounded-3xl border border-emerald-400/10 bg-emerald-400/5 p-5">
                <p className="font-black text-white">
                  Suggestion automatique
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {getBodySuggestion(
                    bodyStats.upperBodyWorkouts,
                    bodyStats.cardioWorkouts,
                    bodyStats.mobilityWorkouts,
                  )}
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
  upperBodyWorkouts: number,
  cardioWorkouts: number,
  mobilityWorkouts: number,
) {
  if (upperBodyWorkouts === 0 && cardioWorkouts === 0) {
    return 'Commence par une petite séance simple : 20 minutes de marche, de mobilité ou de musculation légère.'
  }

  if (upperBodyWorkouts > cardioWorkouts + 2) {
    return 'Tu travailles beaucoup la force. Ajoute une séance cardio courte pour mieux équilibrer ton profil.'
  }

  if (cardioWorkouts > upperBodyWorkouts + 2) {
    return 'Ton cardio est bien présent. Tu pourrais ajouter une séance de renforcement pour équilibrer ton corps.'
  }

  if (mobilityWorkouts === 0) {
    return 'Tu n’as pas encore de séance mobilité. Une courte séance d’étirements pourrait améliorer ta récupération.'
  }

  return 'Ton profil est assez équilibré. Continue à varier les séances pour progresser sans te lasser.'
}

type StatCardProps = {
  label: string
  value: string
  icon: string
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-3xl">{icon}</p>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
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
  const [inputValue, setInputValue] = useState(() => String(value))

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value

    setInputValue(nextValue)

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
      setInputValue(String(min))
      onChange(min)
      return
    }

    setInputValue(String(parsedValue))
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
          ? 'border-emerald-300/50 bg-emerald-300/20 shadow-lg shadow-emerald-400/20'
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
      className={`absolute ${position} rounded-2xl border bg-slate-950 px-4 py-3 ${colorClasses[color]}`}
    >
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  )
}