import { useState } from 'react'
import { api } from '../services/api'
import { useAppStore } from '../store/useAppStore'

const steps = ['Fork', 'Edit', 'Commit', 'PR', 'Feedback']

export default function PRSimulator({ onGoLive }) {
  const [index, setIndex] = useState(0)
  const [issueUrl, setIssueUrl] = useState('')
  const [guide, setGuide] = useState('')
  const { grant, token, username } = useAppStore()

  const next = () => {
    const last = index === steps.length - 1
    grant({ points: 20, simulationComplete: last })
    if (last) {
      useAppStore.getState().addToast('Expecto Patronum!')
    }
    setIndex((s) => (last ? s : s + 1))
  }

  const connectGitHub = async () => {
    const { url } = await api.getOAuthStart()
    window.location.href = url
  }

  const downloadGuide = async () => {
    const data = await api.exportGuide({ issueUrl, username })
    setGuide(data.guide)
    const blob = new Blob([data.guide], { type: 'text/markdown' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'first-pr-guide.md'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <section className="space-y-4 rounded-xl border border-border p-5">
      <h2 className="text-xl font-semibold">PR Simulator</h2>
      {!token ? (
        <button onClick={connectGitHub} className="rounded-md bg-magic px-4 py-2 text-sm">Connect GitHub</button>
      ) : <p className="text-sm text-muted">Connected as {username}</p>}
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted">Step {index + 1} / {steps.length}</p>
        <h3 className="mt-1 text-lg font-medium">{steps[index]}</h3>
        <p className="mt-2 text-sm text-muted">Safe fake repository mode. No real GitHub changes happen here.</p>
        <button onClick={next} className="mt-3 rounded bg-accent px-3 py-2 text-sm text-black">Complete Step</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input value={issueUrl} onChange={(e) => setIssueUrl(e.target.value)} placeholder="Issue URL for export guide" className="rounded-md border border-border bg-transparent p-2 text-sm" />
        <button title="Like sending a patronus" onClick={downloadGuide} className="rounded-md border border-border px-3 py-2 text-sm">Export Guide</button>
      </div>
      {guide ? <pre className="whitespace-pre-wrap rounded bg-black/30 p-3 text-xs">{guide}</pre> : null}
      <button onClick={onGoLive} className="rounded-md bg-accent px-4 py-2 text-sm text-black">Go Live</button>
    </section>
  )
}
