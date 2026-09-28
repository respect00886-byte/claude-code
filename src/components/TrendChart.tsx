import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDate, formatShort } from '../lib/date'
import { fmt } from '../lib/stats'
import { useThemeColors } from '../lib/useThemeColors'

interface Props {
  data: { date: string; value: number }[]
  unit: string
  label: string
}

/** 日付 × 数値の単一系列折れ線グラフ */
export default function TrendChart({ data, unit, label }: Props) {
  const c = useThemeColors()
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        データがありません
      </div>
    )
  }
  return (
    <div className="h-56 w-full" role="img" aria-label={`${label}の推移`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={c.line} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShort}
            tick={{ fill: c.muted, fontSize: 11 }}
            axisLine={{ stroke: c.line }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: c.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => fmt(v)}
          />
          <Tooltip
            cursor={{ stroke: c.muted, strokeWidth: 1 }}
            contentStyle={{
              background: c.surface,
              border: `1px solid ${c.line}`,
              borderRadius: 12,
              color: c.ink,
              fontSize: 13,
            }}
            labelStyle={{ color: c.muted }}
            labelFormatter={(d) => formatDate(String(d))}
            formatter={(v) => [`${fmt(Number(v))} ${unit}`, label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={c.accent}
            strokeWidth={2}
            dot={
              data.length <= 40
                ? { r: 3, fill: c.accent, stroke: c.surface, strokeWidth: 2 }
                : false
            }
            activeDot={{ r: 6, fill: c.accent, stroke: c.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
