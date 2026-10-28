/**
 * ブラウザにデータを消さないよう依頼する (永続ストレージ)。
 * iPhone の Safari などは、しばらく開かなかったサイトのデータを自動で消すことがあるため。
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** 使っている容量（バイト）。分からなければ undefined */
export async function usedBytes(): Promise<number | undefined> {
  try {
    return (await navigator.storage?.estimate?.())?.usage;
  } catch {
    return undefined;
  }
}

export function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.ceil(n / 1024)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}

// 同じサイトに他のアプリも同居しているので、キーに "sake-log:" を付ける
const LAST_BACKUP_KEY = "sake-log:lastBackupAt";

export function getLastBackupAt(): Date | undefined {
  try {
    const v = localStorage.getItem(LAST_BACKUP_KEY);
    return v ? new Date(v) : undefined;
  } catch {
    return undefined;
  }
}

export function setLastBackupAt(d = new Date()) {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, d.toISOString());
  } catch {
    // プライベートブラウズなどで保存できない場合は無視
  }
}
