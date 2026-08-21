export type ChartPoint = {
  label: string
  fullLabel?: string
  value: number
}

type WeeklyBarChartProps = {
  data: ChartPoint[]
  formatValue?: (value: number) => string
  /** Ligne d'objectif horizontale (optionnelle). */
  goal?: number
  goalLabel?: string
  emptyLabel?: string
}

const WIDTH = 720
const HEIGHT = 260
const PADDING_LEFT = 44
const PADDING_RIGHT = 12
const PADDING_TOP = 18
const PADDING_BOTTOM = 34

/**
 * Histogramme hebdomadaire en SVG pur (aucune dépendance). La dernière barre
 * (semaine en cours) est mise en avant. Responsif via `viewBox`.
 */
export default function WeeklyBarChart({
  data,
  formatValue = (value) => String(value),
  goal,
  goalLabel,
  emptyLabel = 'Pas encore de données à afficher.',
}: WeeklyBarChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), goal ?? 0, 1)
  const hasData = data.some((point) => point.value > 0)

  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM
  const slot = plotWidth / data.length
  const barWidth = Math.min(slot * 0.6, 40)

  const yFor = (value: number) =>
    PADDING_TOP + plotHeight - (value / maxValue) * plotHeight

  const gridValues = [0, 0.5, 1].map((ratio) => Math.round(maxValue * ratio))
  const labelEvery = Math.ceil(data.length / 8)

  if (!hasData) {
    return (
      <div className="flex h-40 items-center justify-center rounded-3xl border border-white/10 bg-slate-950/60 text-sm text-slate-400">
        {emptyLabel}
      </div>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label="Histogramme hebdomadaire"
    >
      <defs>
        <linearGradient id="bar-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#83b8ea" />
          <stop offset="100%" stopColor="#3078c6" />
        </linearGradient>
        <linearGradient id="bar-fill-current" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe0ff" />
          <stop offset="100%" stopColor="#5296dc" />
        </linearGradient>
      </defs>

      {/* Lignes de repère + graduations */}
      {gridValues.map((value) => {
        const y = yFor(value)

        return (
          <g key={value}>
            <line
              x1={PADDING_LEFT}
              y1={y}
              x2={WIDTH - PADDING_RIGHT}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text
              x={PADDING_LEFT - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-slate-500"
              fontSize={12}
              fontWeight={700}
            >
              {formatValue(value)}
            </text>
          </g>
        )
      })}

      {/* Ligne d'objectif */}
      {goal !== undefined && goal > 0 && (
        <g>
          <line
            x1={PADDING_LEFT}
            y1={yFor(goal)}
            x2={WIDTH - PADDING_RIGHT}
            y2={yFor(goal)}
            stroke="#f0abfc"
            strokeWidth={1.5}
            strokeDasharray="6 5"
          />
          <text
            x={WIDTH - PADDING_RIGHT}
            y={yFor(goal) - 6}
            textAnchor="end"
            className="fill-fuchsia-300"
            fontSize={11}
            fontWeight={800}
          >
            {goalLabel ?? 'Objectif'}
          </text>
        </g>
      )}

      {/* Barres */}
      {data.map((point, index) => {
        const x = PADDING_LEFT + slot * index + (slot - barWidth) / 2
        const barHeight =
          point.value > 0
            ? Math.max((point.value / maxValue) * plotHeight, 2)
            : 0
        const y = PADDING_TOP + plotHeight - barHeight
        const isCurrent = index === data.length - 1
        const showLabel = index % labelEvery === 0 || isCurrent

        return (
          <g key={`${point.label}-${index}`}>
            {barHeight > 0 && (
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={isCurrent ? 'url(#bar-fill-current)' : 'url(#bar-fill)'}
              >
                <title>
                  {point.fullLabel ?? point.label} · {formatValue(point.value)}
                </title>
              </rect>
            )}

            {showLabel && (
              <text
                x={x + barWidth / 2}
                y={HEIGHT - PADDING_BOTTOM + 20}
                textAnchor="middle"
                className={isCurrent ? 'fill-azur-200' : 'fill-slate-500'}
                fontSize={12}
                fontWeight={isCurrent ? 800 : 600}
              >
                {point.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
