import { useSyncExternalStore } from 'react'

export interface Toast {
  id: number
  message: string
  action?: { label: string; onClick: () => void | Promise<void> }
  /** 表示時間 (ms)。0 なら自動で消えない */
  duration: number
}

let current: Toast | undefined
let nextId = 1
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function showToast(
  message: string,
  options: { action?: Toast['action']; duration?: number } = {},
) {
  clearTimeout(timer)
  const toast: Toast = {
    id: nextId++,
    message,
    action: options.action,
    duration: options.duration ?? 5000,
  }
  current = toast
  emit()
  if (toast.duration > 0) timer = setTimeout(() => dismissToast(toast.id), toast.duration)
}

export function dismissToast(id?: number) {
  if (id !== undefined && current?.id !== id) return
  clearTimeout(timer)
  current = undefined
  emit()
}

/** 「元に戻す」付きのトースト */
export function showUndoToast(message: string, undo: () => Promise<void>) {
  showToast(message, {
    action: {
      label: '元に戻す',
      onClick: async () => {
        await undo()
        showToast('元に戻しました', { duration: 2000 })
      },
    },
  })
}

export function useToast(): Toast | undefined {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}
