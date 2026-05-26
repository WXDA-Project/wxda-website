// Pure server component — renders an SVG, no client JS.

const SVG_W   = 600
const CHART_H = 60
const AXIS_H  = 16
const SVG_H   = CHART_H + AXIS_H

function datesToBins(dates: (string | null)[], minYear: number, maxYear: number): Map<number, number> {
  const bins = new Map<number, number>()
  for (const d of dates) {
    if (!d) continue
    const y = parseInt(d.slice(0, 4), 10)
    if (y >= minYear && y <= maxYear) bins.set(y, (bins.get(y) ?? 0) + 1)
  }
  return bins
}

interface Props {
  archiveDates: (string | null)[]
  filteredDates: (string | null)[]
  minDate: string
  maxDate: string
}

export default function TimelineChart({ archiveDates, filteredDates, minDate, maxDate }: Props) {
  const MIN_YEAR = parseInt(minDate.slice(0, 4), 10)
  const MAX_YEAR = parseInt(maxDate.slice(0, 4), 10)
  const YEARS    = MAX_YEAR - MIN_YEAR + 1
  const BAR_SLOT = SVG_W / YEARS
  const BAR_W    = BAR_SLOT - 0.75

  const allBins  = datesToBins(archiveDates, MIN_YEAR, MAX_YEAR)
  const filtBins = datesToBins(filteredDates, MIN_YEAR, MAX_YEAR)
  const maxCount = Math.max(1, ...allBins.values())

  const axisTicks: Array<{ year: number; anchor: 'start' | 'middle' | 'end' }> = [
    { year: MIN_YEAR, anchor: 'start'  },
    { year: 1800,     anchor: 'middle' },
    { year: 1820,     anchor: 'middle' },
    { year: 1840,     anchor: 'middle' },
    { year: MAX_YEAR, anchor: 'end'    },
  ]

  function barHeight(count: number) {
    return (count / maxCount) * CHART_H
  }

  return (
    <div className="mb-3" aria-hidden="true">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: 'block' }}>
        {Array.from({ length: YEARS }, (_, i) => {
          const year  = MIN_YEAR + i
          const count = allBins.get(year) ?? 0
          if (count === 0) return null
          const h = barHeight(count)
          return (
            <rect key={`a${year}`} x={i * BAR_SLOT} y={CHART_H - h} width={BAR_W} height={h} fill="var(--color-border)" />
          )
        })}
        {Array.from({ length: YEARS }, (_, i) => {
          const year  = MIN_YEAR + i
          const count = filtBins.get(year) ?? 0
          if (count === 0) return null
          const h = barHeight(count)
          return (
            <rect key={`f${year}`} x={i * BAR_SLOT} y={CHART_H - h} width={BAR_W} height={h} fill="var(--color-crimson)" />
          )
        })}
        <line x1={0} y1={CHART_H} x2={SVG_W} y2={CHART_H} stroke="var(--color-border)" strokeWidth={0.75} />
        {axisTicks.map(({ year, anchor }) => (
          <text
            key={year}
            x={(year - MIN_YEAR) * BAR_SLOT}
            y={CHART_H + 12}
            fontSize={9}
            fill="var(--color-muted)"
            textAnchor={anchor}
            fontFamily="Georgia,'Times New Roman',serif"
          >
            {year}
          </text>
        ))}
        <rect x={SVG_W - 104} y={5}  width={7} height={7} fill="var(--color-border)" />
        <text x={SVG_W - 93} y={12} fontSize={8} fill="var(--color-muted)" fontFamily="Georgia,'Times New Roman',serif">all records</text>
        <rect x={SVG_W - 104} y={17} width={7} height={7} fill="var(--color-crimson)" />
        <text x={SVG_W - 93} y={24} fontSize={8} fill="var(--color-muted)" fontFamily="Georgia,'Times New Roman',serif">filtered</text>
      </svg>
    </div>
  )
}
