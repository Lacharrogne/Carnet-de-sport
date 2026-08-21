import type { ChartPoint } from './WeeklyBarChart'

type TrendLineChartProps = {
  data: ChartPoint[]
  formatValue?: (value: number) => string
  emptyLabel?: string
  /**
   * Valeur de base de l'axe Y. Par défaut 0. Passer `'auto'` resserre l'échelle
   * autour des données (utile pour de faibles variations, ex. le poids).
   */
  yBaseline?: number | 'auto'
}

const WIDTH = 720
const HEIGHT = 240
const PADDING_LEFT = 44
const PADDING_RIGHT = 12
const PADDING_TOP = 18
const PADDING_BOTTOM = 34

/**
 * Courbe de tendance en SVG pur (aire + ligne + points). Responsif via
 * `viewBox`. Le dernier point (semaine en cours) est mis en avant.
 */
export default function TrendLineChart({
  data,
  formatValue = (value) => String(value),
  emptyLabel = 'Pas encore de données à afficher.',
  yBaseline = 0,
}: TrendLineChartProps) {
  const values = data.map((point) => point.value)
  const dataMax = Math.max(...values, 1)
  const dataMin = Math.min(...values)
  const hasData = data.some((point) => point.value > 0)

  // Base de l'axe : 0 par défaut, ou une base resserrée sous le minimum.
  const minValue =
    yBaseline === 'auto'
      ? Math.max(0, Math.floor(dataMin - (dataMax - dataMin) * 0.15 - 0.5))
      : yBaseline
  const maxValue = dataMax > minValue ? dataMax : minValue + 1

  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM

  const xFor = (index: number) =>
    data.length <= 1
      ? PADDING_LEFT + plotWidth / 2
      : PADDING_LEFT + (index / (data.length - 1)) * plotWidth

  const yFor = (value: number) =>
    PADDING_TOP +
    plotHeight -
    ((value - minValue) / (maxValue - minValue)) * plotHeight

  const gridValues = [0, 0.5, 1].map((ratio) =>
    Math.round(minValue + (maxValue - minValue) * ratio),
  )
  const labelEvery = Math.ceil(data.length / 8)

  const points = data.map((point, index) => ({
    ...point,
    x: xFor(index),
    y: yFor(point.value),
  }))

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${
          PADDING_TOP + plotHeight
        } L ${points[0].x} ${PADDING_TOP + plotHeight} Z`
      : ''

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
      aria-label="Courbe de tendance"
    >
      <defs>
        <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(82,150,220,0.35)" />
          <stop offset="100%" stopColor="rgba(82,150,220,0)" />
        </linearGradient>
      </defs>

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

      {areaPath && <path d={areaPath} fill="url(#trend-area)" />}

      <path
        d={linePath}
        fill="none"
        stroke="#5296dc"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map((point, index) => {
        const isCurrent = index === points.length - 1
        const showLabel = index % labelEvery === 0 || isCurrent

        return (
          <g key={`${point.label}-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={isCurrent ? 5 : 3.5}
              fill={isCurrent ? '#bfe0ff' : '#5296dc'}
              stroke="#0b1220"
              strokeWidth={1.5}
            >
              <title>
                {point.fullLabel ?? point.label} · {formatValue(point.value)}
              </title>
            </circle>

            {showLabel && (
              <text
                x={point.x}
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
