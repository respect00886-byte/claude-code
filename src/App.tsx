import { createHashRouter, Outlet, RouterProvider } from 'react-router'
import BottomNav from './components/BottomNav'
import Toaster from './components/Toaster'
import UpdatePrompt from './components/UpdatePrompt'
import TodayPage from './pages/TodayPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

function Layout() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <Outlet />
      <BottomNav />
      <Toaster />
      <UpdatePrompt />
    </div>
  )
}

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'history', element: <HistoryPage /> },
      {
        path: 'weight',
        // グラフライブラリを含むページは遅延読み込み
        lazy: () => import('./pages/WeightPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'stats',
        lazy: () => import('./pages/StatsPage').then((m) => ({ Component: m.default })),
      },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
