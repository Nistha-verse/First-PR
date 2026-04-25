import { useState } from 'react'
import { api } from '../services/api'
import { useAppStore } from '../store/useAppStore'
import { playSound } from '../services/sound'

export default function IssueFinder({ onPractice }) {
  const [skills, setSkills] = useState('React, JavaScript')
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [autopsies, setAutopsies] = useState({})
  const [explanations, setExplanations] = useState({})
  const [error, setError] = useState('')
  const { token, grant, addToast } = useAppStore()

  const fetchIssues = async () => {
    if (!token) return setError('Connect GitHub first from simulator tab.')
    setLoading(true)
    setError('')
    try {
      const data = await api.findIssues(skills, token)
      setIssues(data.issues || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const explain = async (issue) => {
    const data = await api.explainIssue(issue, token)
    setExplanations((s) => ({ ...s, [issue.url]: data.explanation }))
    grant({ points: 10, aiAssist: true })
  }

  const autopsy = async (issue) => {
    playSound('eerie')
    const data = await api.issueAutopsy(issue, token)
    setAutopsies((s) => ({ ...s, [issue.url]: data }))
    setExpanded((s) => ({ ...s, [issue.url]: true }))
    grant({ points: 25 })
    addToast('Autopsy complete')
  }

  return (
    <section className="space-y-4 rounded-xl border border-border p-5">
      <h2 className="text-xl font-semibold">Issue Finder</h2>
      <div className="flex gap-3">
        <input value={skills} onChange={(e) => setSkills(e.target.value)} className="flex-1 rounded-md border border-border bg-transparent p-2 text-sm" />
        <button onClick={fetchIssues} className="rounded-md bg-accent px-4 py-2 text-black">{loading ? <span className="wand-tip-loader" /> : 'Find issues'}</button>
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <div className="space-y-3">
        {issues.map((issue) => (
          <article key={issue.url} className="rounded-lg border border-border p-4">
            <h3 className="text-base font-semibold">{issue.title}</h3>
            <p className="mt-1 text-xs text-muted">{issue.repo}</p>
            <p className="mt-2 text-sm text-muted">{issue.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => explain(issue)} className="rounded border border-border px-2 py-1 text-xs">Explain with AI</button>
              <button onClick={() => autopsy(issue)} className="rounded border border-warning px-2 py-1 text-xs text-warning">View Autopsy</button>
              <button onClick={onPractice} className="rounded border border-accent px-2 py-1 text-xs">Practice in Simulator</button>
            </div>
            {explanations[issue.url] ? <pre className="mt-3 whitespace-pre-wrap rounded bg-black/30 p-3 text-xs">{explanations[issue.url]}</pre> : null}
            {expanded[issue.url] && autopsies[issue.url] ? (
              <div className="mt-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
                <p>This issue has been attempted by {autopsies[issue.url].totalAttempts} beginners.</p>
                <p className="mt-1">Most common cause: {autopsies[issue.url].commonCause}</p>
                <p className="mt-1">Risky files: {(autopsies[issue.url].riskyFiles || []).join(', ') || 'None detected'}</p>
                <p className="mt-1">Survival chance: {autopsies[issue.url].survivalChance}%</p>
                <ul className="mt-2 list-disc pl-6 text-muted">
                  {(autopsies[issue.url].survivalTips || []).map((tip) => <li key={tip}>{tip}</li>)}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
