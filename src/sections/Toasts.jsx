import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function Toasts() {
  const { toasts, popToast } = useAppStore()

  useEffect(() => {
    if (toasts.length === 0) return undefined
    const id = toasts[0].id
    const timer = setTimeout(() => popToast(id), 2600)
    return () => clearTimeout(timer)
  }, [toasts, popToast])

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.slice(0, 2).map((t) => (
        <div key={t.id} className="rounded bg-accent px-3 py-2 text-sm text-black shadow-lg">{t.text}</div>
      ))}
    </div>
  )
}
