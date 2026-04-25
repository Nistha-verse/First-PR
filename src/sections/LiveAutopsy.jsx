import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { playSound } from '../services/sound'

export default function LiveAutopsy() {
  const [events, setEvents] = useState([])
  const { token, username, grant, addToast } = useAppStore()

  useEffect(() => {
    if (!token || !username) return undefined

    let active = true
    const poll = async () => {
      try {
        const res = await fetch(`/.netlify/functions/live-events?user=${encodeURIComponent(username)}`)
        const data = await res.json()
        const incoming = data.events || []
        if (!active || incoming.length === 0) return

        const normalized = incoming.map((e) => ({
          type: e.type,
          title: e.title,
          repo: e.repo,
          sha: e.sha,
          lines: e.lines,
          ts: e.created_at,
        }))
        setEvents((s) => {
          const merged = [...normalized, ...s]
          const deduped = merged.filter((item, idx, arr) => idx === arr.findIndex((x) => x.sha === item.sha && x.ts === item.ts))
          return deduped.slice(0, 20)
        })

        normalized.forEach((eventItem) => {
          if (eventItem.type === 'warning') {
            grant({ points: 50, bugCaught: true })
          }
          if (eventItem.type === 'ready') {
            playSound('whoosh')
            addToast('✅ Ready for maintainer')
          }
        })
      } catch {
        // Keep polling; transient network errors are expected in serverless setups.
      }
    }

    poll()
    const timer = setInterval(poll, 4000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [token, username, grant, addToast])

  return (
    <section className="space-y-4 rounded-xl border border-border p-5">
      <h2 className="text-xl font-semibold">Live Autopsy</h2>
      <p className="text-sm text-muted">
        Configure GitHub webhook to <code>/.netlify/functions/github-webhook</code> and open a real PR.
      </p>
      <div className="space-y-2">
        {events.length === 0 ? <p className="text-sm text-muted">Waiting for webhook events...</p> : null}
        {events.map((e, i) => (
          <div key={`${e.sha}-${i}`} className="rounded-md border border-border p-3 text-sm">
            <p className="font-medium">{e.title}</p>
            <p className="text-xs text-muted">{e.repo} - {e.sha?.slice(0, 7)}</p>
            {e.lines?.length ? (
              <ul className="mt-2 list-disc pl-5 text-warning">
                {e.lines.map((l) => <li key={`${l.file}-${l.line}`}>{l.file}:{l.line} - {l.message}</li>)}
              </ul>
            ) : <p className="mt-1 text-xs text-success">No risky issues found.</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
