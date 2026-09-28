import type { CategoryVolume as Row } from '../lib/stats'
import { fmtVolume } from '../lib/stats'

/** その日の部位ごとのボリューム */
export default function CategoryVolume({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null
  return (
    <section
      aria-label="部位ごとのボリューム"
      className="rounded-2xl border border-line bg-surface px-4 py-3"
    >
      <h2 className="mb-2 text-xs font-medium text-muted">部位ごとのボリューム</h2>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {rows.map((r) => (
          <li key={r.category} className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-sm font-bold">{r.category}</span>
            <span className="text-sm">
              {[
                r.volume > 0 && fmtVolume(r.volume),
                r.bodyweightReps > 0 && `自重${r.bodyweightReps}回`,
              ]
                .filter(Boolean)
                .join(' ＋ ')}
            </span>
            <span className="text-xs text-muted">{r.sets}セット</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
