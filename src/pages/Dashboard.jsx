import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import IssueFinder from '../sections/IssueFinder'
import PRSimulator from '../sections/PRSimulator'
import LiveAutopsy from '../sections/LiveAutopsy'
import Toasts from '../sections/Toasts'
import { playSound } from '../services/sound'

const tabs = [
  { label: 'Issue Finder', icon: '🪄' },
  { label: 'PR Simulator', icon: '📜' },
  { label: 'Live Autopsy', icon: '🔮' },
  { label: 'Profile', icon: '🏆' },
]

export default function Dashboard() {
  const [active, setActive] = useState(tabs[0].label)
  const { level, points = 0, badges = [], username, dark, toggleDark, logout, toasts } = useAppStore()

  useEffect(() => {
    const latest = toasts[toasts.length - 1]?.text || ''
    if (latest === 'success-chime') playSound('chime')
    if (latest === 'level-up') playSound('level')
  }, [toasts])

  return (
    <main className={`${dark ? 'bg-bg text-text' : 'bg-slate-50 text-slate-900'} min-h-screen p-6`}>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-xl border border-magic/30 bg-gradient-to-r from-[#120f1f] to-[#171127] p-5 shadow-[0_0_25px_rgba(109,40,217,0.2)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="magic-heading text-2xl font-semibold">FIRST PR</h1>
              <p className="text-sm text-muted">Learn from the dead. Practice safely. Launch with confidence.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-border px-3 py-1 text-xs">Level: {level || 'Trainee'}</span>
              <span className="rounded-lg border border-accent/40 bg-accent/20 px-3 py-1 text-xs text-violet-200">{points} pts</span>
              <button onClick={toggleDark} className="rounded-md border border-magic/40 bg-black/30 px-3 py-1 text-xs">
                {dark ? 'Knox' : 'Lumos'}
              </button>
              {username ? (
                <button onClick={logout} className="rounded-md border border-magic/40 bg-black/30 px-3 py-1 text-xs">Logout {username}</button>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActive(tab.label)}
                className={`rounded-md px-4 py-2 text-sm transition ${active === tab.label ? 'bg-accent text-violet-100 shadow-[0_0_15px_rgba(109,40,217,0.4)]' : 'bg-slate-900 text-muted hover:bg-slate-800'}`}
              >
                <span className="mr-2">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </header>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={active}>
          {active === 'Issue Finder' && <IssueFinder onPractice={() => setActive('PR Simulator')} />}
          {active === 'PR Simulator' && <PRSimulator onGoLive={() => setActive('Live Autopsy')} />}
          {active === 'Live Autopsy' && <LiveAutopsy />}
          {active === 'Profile' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border p-5">
                <h2 className="mb-3 text-xl font-semibold">Badges</h2>
                <ul className="space-y-2 text-sm text-muted">
                  {badges.length ? badges.map((b) => <li key={b}>- {b}</li>) : <li>No badges yet.</li>}
                </ul>
              </div>
              <div className="rounded-xl border border-border p-5">
                <h2 className="mb-3 text-xl font-semibold">Leaderboard</h2>
                <p className="text-sm text-muted">Local rank appears after your first simulator or autopsy action.</p>
              </div>
            </div>
          )}
        </motion.section>
      </div>
      <Toasts />
    </main>
  )
}
