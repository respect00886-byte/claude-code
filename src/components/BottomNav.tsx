import { NavLink } from 'react-router'
import { CalendarDays, ChartLine, Dumbbell, Scale, Settings } from 'lucide-react'

const ITEMS = [
  { to: '/', label: '記録', icon: Dumbbell },
  { to: '/history', label: '履歴', icon: CalendarDays },
  { to: '/weight', label: '体重', icon: Scale },
  { to: '/stats', label: 'グラフ', icon: ChartLine },
  { to: '/settings', label: '設定', icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-accent' : 'text-muted'
                }`
              }
            >
              <Icon size={22} strokeWidth={2} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
