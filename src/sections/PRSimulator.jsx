import { useMemo, useState } from 'react'
import { api } from '../services/api'
import { useAppStore } from '../store/useAppStore'

const steps = ['Fork', 'Edit', 'Commit', 'PR', 'Feedback']
const initialFiles = {
  'src/utils/formatName.js': `export function formatName(user) {
  return user.name.toUpperCase()
}
`,
  'src/components/ProfileCard.jsx': `export default function ProfileCard({ user }) {
  return <h2>{user.name}</h2>
}
`,
}

export default function PRSimulator({ onGoLive }) {
  const [index, setIndex] = useState(0)
  const [issueUrl, setIssueUrl] = useState('')
  const [guide, setGuide] = useState('')
  const [files, setFiles] = useState(initialFiles)
  const [selectedFile, setSelectedFile] = useState('src/utils/formatName.js')
  const [draft, setDraft] = useState(initialFiles['src/utils/formatName.js'])
  const [commits, setCommits] = useState([])
  const [prOpened, setPrOpened] = useState(false)
  const [feedback, setFeedback] = useState([])
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

  const changedFiles = useMemo(
    () => Object.keys(files).filter((path) => files[path] !== initialFiles[path]),
    [files]
  )

  const stageCurrentFileChange = () => {
    setFiles((prev) => ({ ...prev, [selectedFile]: draft }))
    grant({ points: 8 })
  }

  const commitChanges = () => {
    if (changedFiles.length === 0) return
    const message = `fix: update ${changedFiles.length} file${changedFiles.length > 1 ? 's' : ''}`
    setCommits((prev) => [{ id: crypto.randomUUID(), message, files: changedFiles, at: new Date().toLocaleTimeString() }, ...prev])
    grant({ points: 15 })
  }

  const openSimulatedPR = () => {
    if (commits.length === 0) return
    setPrOpened(true)
    const warnings = []
    if (!draft.includes('?.') && selectedFile.includes('formatName')) {
      warnings.push({ file: selectedFile, line: 2, message: 'Potential null check missing for user.name' })
    }
    if (!draft.includes('return') && selectedFile.includes('formatName')) {
      warnings.push({ file: selectedFile, line: 2, message: 'Function should return a value' })
    }
    setFeedback(warnings)
    grant({ points: warnings.length ? 5 : 25 })
  }

  return (
    <section className="space-y-4 rounded-xl border border-magic/30 bg-[#0f0b1a]/80 p-5 shadow-[0_0_18px_rgba(109,40,217,0.16)]">
      <h2 className="magic-heading text-xl font-semibold">PR Simulator</h2>
      {!token ? (
        <button onClick={connectGitHub} className="rounded-md bg-magic px-4 py-2 text-sm text-violet-100">Connect GitHub</button>
      ) : <p className="text-sm text-muted">Connected as {username}</p>}
      <div className="rounded-lg border border-magic/30 bg-black/25 p-4">
        <p className="text-sm text-muted">Step {index + 1} / {steps.length}</p>
        <h3 className="mt-1 text-lg font-medium">{steps[index]}</h3>
        <p className="mt-2 text-sm text-muted">Safe fake repository mode. No real GitHub changes happen here.</p>
        <button onClick={next} className="mt-3 rounded bg-accent px-3 py-2 text-sm text-violet-100">Complete Step</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px,1fr,300px]">
        <div className="rounded-lg border border-magic/20 bg-black/25 p-3">
          <p className="mb-2 text-xs font-semibold text-muted">Fake Repo Files</p>
          <div className="space-y-2">
            {Object.keys(files).map((path) => (
              <button
                key={path}
                onClick={() => {
                  setSelectedFile(path)
                  setDraft(files[path])
                }}
                className={`w-full rounded px-2 py-1 text-left text-xs ${selectedFile === path ? 'bg-accent/30 text-violet-200' : 'bg-slate-900 text-muted'}`}
              >
                {path}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-magic/20 bg-black/25 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-muted">{selectedFile}</p>
            <button onClick={stageCurrentFileChange} className="rounded border border-magic/40 bg-magic/10 px-2 py-1 text-xs">Save file</button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-64 w-full rounded bg-black/40 p-3 font-mono text-xs text-slate-100"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={commitChanges} className="rounded border border-magic/40 bg-magic/10 px-2 py-1 text-xs">
              Commit ({changedFiles.length} changed)
            </button>
            <button onClick={openSimulatedPR} className="rounded bg-accent px-2 py-1 text-xs text-violet-100">
              Open Simulated PR
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-magic/20 bg-black/25 p-3">
          <div>
            <p className="mb-1 text-xs font-semibold text-muted">Commit History</p>
            {commits.length === 0 ? <p className="text-xs text-muted">No commits yet.</p> : commits.map((c) => (
              <div key={c.id} className="mb-2 rounded bg-black/30 p-2">
                <p className="text-xs">{c.message}</p>
                <p className="text-[11px] text-muted">{c.at}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-muted">PR Feedback</p>
            {!prOpened ? <p className="text-xs text-muted">Open a simulated PR to get review.</p> : null}
            {prOpened && feedback.length === 0 ? <p className="text-xs text-success">Clean PR. Ready to submit.</p> : null}
            {feedback.map((f) => (
              <p key={`${f.file}-${f.line}`} className="mb-1 text-xs text-warning">{f.file}:{f.line} - {f.message}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input value={issueUrl} onChange={(e) => setIssueUrl(e.target.value)} placeholder="Issue URL for export guide" className="rounded-md border border-magic/40 bg-black/20 p-2 text-sm" />
        <button title="Like sending a patronus" onClick={downloadGuide} className="rounded-md border border-magic/40 bg-magic/10 px-3 py-2 text-sm">Export Guide</button>
      </div>
      {guide ? <pre className="whitespace-pre-wrap rounded bg-black/30 p-3 text-xs">{guide}</pre> : null}
      <button onClick={onGoLive} className="rounded-md bg-accent px-4 py-2 text-sm text-violet-100">Go Live</button>
    </section>
  )
}
