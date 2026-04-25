import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { playSound } from '../services/sound'

export default function LiveAutopsy() {
  const [events, setEvents] = useState([])
  const { token, username, grant, addToast } = useAppStore()

  useEffect(() => {
    if (!token || !username) return undefined
    const stream = new EventSource(`/.netlify/functions/sse?user=${encodeURIComponent(username)}`)
    stream.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setEvents((s) => [data, ...s].slice(0, 20))
      if (data.type === 'warning') {
        grant({ points: 50, bugCaught: true })
      }
      if (data.type === 'ready') {
        playSound('whoosh')
        addToast('✅ Ready for maintainer')
      }
    }
    stream.onerror = () => stream.close()
    return () => stream.close()
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
