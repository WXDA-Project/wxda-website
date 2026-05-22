// Pure server component — renders an SVG, no client JS.

import { DATE_FILTER_FIELD } from '@/lib/field-config'

const MIN_YEAR = parseInt(DATE_FILTER_FIELD.minDate!.slice(0, 4), 10)
const MAX_YEAR = parseInt(DATE_FILTER_FIELD.maxDate!.slice(0, 4), 10)
const YEARS    = MAX_YEAR - MIN_YEAR + 1

const SVG_W   = 600
const CHART_H = 60   // bar area (SVG units)
const AXIS_H  = 16   // label strip below bars
const SVG_H   = CHART_H + AXIS_H

const BAR_SLOT = SVG_W / YEARS            // width allocated per year ≈ 9.4
const BAR_W    = BAR_SLOT - 0.75          // bar width with a small gap

function datesToBins(dates: (string | null)[]): Map<number, number> {
  const bins = new Map<number, number>()
  for (const d of dates) {
    if (!d) continue
    const y = parseInt(d.slice(0, 4), 10)
    if (y >= MIN_YEAR && y <= MAX_YEAR) bins.set(y, (bins.get(y) ?? 0) + 1)
  }
  return bins
}

interface Props {
  archiveDates: (string | null)[]
  filteredDates: (string | null)[]
}

const AXIS_TICKS: Array<{ year: number; anchor: 'start' | 'middle' | 'end' }> = [
  { year: MIN_YEAR, anchor: 'start'  },
  { year: 1800,     anchor: 'middle' },
  { year: 1820,     anchor: 'middle' },
  { year: 1840,     anchor: 'middle' },
  { year: MAX_YEAR, anchor: 'end'    },
]

export default function TimelineChart({ archiveDates, filteredDates }: Props) {
  const allBins  = datesToBins(archiveDates)
  const filtBins = datesToBins(filteredDates)
  const maxCount = Math.max(1, ...allBins.values())

  function barHeight(count: number) {
    return (count / maxCount) * CHART_H
  }

  return (
    <div className="mb-3" aria-hidden="true">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ display: 'block' }}
      >
        {/* ── Grey bars — full archive ─────────────────────────────── */}
        {Array.from({ length: YEARS }, (_, i) => {
          const year  = MIN_YEAR + i
          const count = allBins.get(year) ?? 0
          if (count === 0) return null
          const h = barHeight(count)
          return (
            <rect
              key={`a${year}`}
              x={i * BAR_SLOT}
              y={CHART_H - h}
              width={BAR_W}
              height={h}
              fill="#d4c5a9"
            />
          )
        })}

        {/* ── Crimson bars — current filtered results ──────────────── */}
        {Array.from({ length: YEARS }, (_, i) => {
          const year  = MIN_YEAR + i
          const count = filtBins.get(year) ?? 0
          if (count === 0) return null
          const h = barHeight(count)
          return (
            <rect
              key={`f${year}`}
              x={i * BAR_SLOT}
              y={CHART_H - h}
              width={BAR_W}
              height={h}
              fill="#7a1f1f"
            />
          )
        })}

        {/* ── Baseline ─────────────────────────────────────────────── */}
        <line
          x1={0} y1={CHART_H} x2={SVG_W} y2={CHART_H}
          stroke="#d4c5a9" strokeWidth={0.75}
        />

        {/* ── Year labels ──────────────────────────────────────────── */}
        {AXIS_TICKS.map(({ year, anchor }) => (
          <text
            key={year}
            x={(year - MIN_YEAR) * BAR_SLOT}
            y={CHART_H + 12}
            fontSize={9}
            fill="#6b5f4e"
            textAnchor={anchor}
            fontFamily="Georgia,'Times New Roman',serif"
          >
            {year}
          </text>
        ))}

        {/* ── Legend ───────────────────────────────────────────────── */}
        <rect x={SVG_W - 104} y={5}  width={7} height={7} fill="#d4c5a9" />
        <text
          x={SVG_W - 93} y={12}
          fontSize={8} fill="#6b5f4e"
          fontFamily="Georgia,'Times New Roman',serif"
        >
          all records
        </text>
        <rect x={SVG_W - 104} y={17} width={7} height={7} fill="#7a1f1f" />
        <text
          x={SVG_W - 93} y={24}
          fontSize={8} fill="#6b5f4e"
          fontFamily="Georgia,'Times New Roman',serif"
        >
          filtered
        </text>
      </svg>
    </div>
  )
}
