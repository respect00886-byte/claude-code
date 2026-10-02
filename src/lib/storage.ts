/**
 * ブラウザにデータを消さないよう依頼する (永続ストレージ)。
 * Safari などは、使われていないサイトのデータを自動で消すことがあるため。
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  try {
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function isStoragePersisted(): Promise<boolean | undefined> {
  if (!navigator.storage?.persisted) return undefined
  try {
    return await navigator.storage.persisted()
  } catch {
    return undefined
  }
}

/** ホーム画面から起動しているか */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS はデスクトップの UA を名乗るため
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

const LAST_BACKUP_KEY = 'gymlog:lastBackupAt'

export function getLastBackupAt(): Date | undefined {
  try {
    const v = localStorage.getItem(LAST_BACKUP_KEY)
    return v ? new Date(v) : undefined
  } catch {
    return undefined
  }
}

export function setLastBackupAt(d = new Date()) {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, d.toISOString())
  } catch {
    // プライベートブラウズなどで保存できない場合は無視
  }
}
