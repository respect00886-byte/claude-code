import { useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

interface Props {
  label: string
  unit?: string
  value: number
  onChange: (v: number) => void
  step: number
  min?: number
  max?: number
  decimals?: number
}

const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d

/** 大きな ± ボタン付きの数値入力。長押しで連続変化、数字部分は直接入力も可 */
export default function Stepper({
  label,
  unit,
  value,
  onChange,
  step,
  min = 0,
  max = 9999,
  decimals = 0,
}: Props) {
  const [text, setText] = useState(String(value))
  const [editing, setEditing] = useState(false)
  const valueRef = useRef(value)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const clamp = (v: number) => Math.min(max, Math.max(min, round(v, decimals)))

  const bump = (dir: 1 | -1) => {
    const next = clamp(valueRef.current + dir * step)
    valueRef.current = next
    onChange(next)
  }

  const startRepeat = (dir: 1 | -1) => {
    bump(dir)
    let delay = 400
    const tick = () => {
      bump(dir)
      delay = Math.max(60, delay * 0.8)
      timer.current = setTimeout(tick, delay)
    }
    timer.current = setTimeout(tick, delay)
  }
  const stopRepeat = () => clearTimeout(timer.current)
  useEffect(() => stopRepeat, [])

  const commit = () => {
    setEditing(false)
    const n = Number(text.replace(',', '.'))
    if (text.trim() !== '' && Number.isFinite(n)) onChange(clamp(n))
  }

  const btn =
    'flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-ink select-none active:scale-95 active:bg-line transition-transform touch-manipulation'

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`${label}を減らす`}
        className={btn}
        onPointerDown={(e) => {
          e.preventDefault()
          startRepeat(-1)
        }}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Minus size={26} />
      </button>
      <label className="flex min-w-0 flex-1 flex-col items-center">
        <span className="text-xs font-medium text-muted">
          {label}
          {unit && <span className="ml-1">({unit})</span>}
        </span>
        <input
          type="number"
          inputMode={decimals > 0 ? 'decimal' : 'numeric'}
          aria-label={label}
          className="w-full min-w-0 bg-transparent text-center text-4xl font-bold tabular-nums outline-none"
          value={editing ? text : String(value)}
          onFocus={(e) => {
            setEditing(true)
            setText(String(value))
            e.currentTarget.select()
          }}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
      </label>
      <button
        type="button"
        aria-label={`${label}を増やす`}
        className={btn}
        onPointerDown={(e) => {
          e.preventDefault()
          startRepeat(1)
        }}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Plus size={26} />
      </button>
    </div>
  )
}
