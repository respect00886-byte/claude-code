import { useRouteError } from 'react-router'
import { TriangleAlert } from 'lucide-react'

/** 保存場所 (IndexedDB) まわりで起きるエラーの名前 */
const STORAGE_ERRORS = [
  'UnknownError',
  'InvalidStateError',
  'OpenFailedError',
  'DatabaseClosedError',
  'MissingAPIError',
]

function isStorageError(e: unknown): boolean {
  const err = e as { name?: string; inner?: { name?: string } } | null
  return STORAGE_ERRORS.includes(err?.name ?? '') || STORAGE_ERRORS.includes(err?.inner?.name ?? '')
}

/** 予想外のエラーで画面を出せないとき、英語のエラーの代わりに出す案内 */
export default function ErrorScreen() {
  const error = useRouteError()
  const storage = isStorageError(error)
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 py-8">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <TriangleAlert size={32} className="mb-2 text-accent" />
        <h1 className="text-lg font-bold">
          {storage ? '記録の保存場所を開けませんでした' : '問題が起きました'}
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          {storage
            ? 'もう一度読み込むか、ホーム画面の GymLog アイコンから開いてください。'
            : 'もう一度読み込んでください。'}
        </p>
        <button
          onClick={() => location.reload()}
          className="mt-4 min-h-12 w-full rounded-xl bg-accent font-bold text-accent-ink active:opacity-80"
        >
          もう一度読み込む
        </button>
      </div>
      {/* 問い合わせのときに伝えられるよう、元のエラーも小さく残す */}
      <p className="text-xs break-all text-muted">{detail}</p>
    </main>
  )
}
