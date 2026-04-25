import { create } from 'zustand'

const BADGE_RULES = [
  { id: 'chosen_one', name: 'The Chosen One', condition: (s) => s.simulationsCompleted >= 1 },
  { id: 'marauder', name: 'The Marauder', condition: (s) => s.simulationsCompleted >= 5 },
  { id: 'alchemist', name: 'The Alchemist', condition: (s) => s.aiAssists >= 1 },
  { id: 'necromancer', name: 'Necromancer', condition: (s) => s.highRiskWins >= 1 },
  { id: 'bug_hunter', name: 'Bug Hunter', condition: (s) => s.bugsCaught >= 1 },
]

const LEVELS = ['Trainee', 'Junior Guardian', 'PR Master']

const loadState = () => {
  try {
    const raw = localStorage.getItem('first-pr-state')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const persist = (state) => localStorage.setItem('first-pr-state', JSON.stringify(state))

export const useAppStore = create((set, get) => ({
  ...loadState(),
  points: loadState().points ?? 0,
  badges: loadState().badges ?? [],
  simulationsCompleted: loadState().simulationsCompleted ?? 0,
  aiAssists: loadState().aiAssists ?? 0,
  bugsCaught: loadState().bugsCaught ?? 0,
  highRiskWins: loadState().highRiskWins ?? 0,
  leaderboard: loadState().leaderboard ?? [],
  token: sessionStorage.getItem('github_token') ?? '',
  username: sessionStorage.getItem('github_user') ?? '',
  dark: true,
  toasts: [],
  addToast: (text) => set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), text }] })),
  popToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setAuth: ({ token, username }) => {
    sessionStorage.setItem('github_token', token)
    sessionStorage.setItem('github_user', username)
    set({ token, username })
  },
  logout: () => {
    sessionStorage.removeItem('github_token')
    sessionStorage.removeItem('github_user')
    set({ token: '', username: '' })
  },
  toggleDark: () => set((s) => ({ dark: !s.dark })),
  grant: ({ points = 0, aiAssist = false, simulationComplete = false, bugCaught = false, highRiskWin = false }) => {
    const current = get()
    const next = {
      ...current,
      points: current.points + points,
      aiAssists: current.aiAssists + (aiAssist ? 1 : 0),
      simulationsCompleted: current.simulationsCompleted + (simulationComplete ? 1 : 0),
      bugsCaught: current.bugsCaught + (bugCaught ? 1 : 0),
      highRiskWins: current.highRiskWins + (highRiskWin ? 1 : 0),
    }
    const earned = BADGE_RULES.filter((r) => r.condition(next) && !next.badges.includes(r.name)).map((r) => r.name)
    const level = LEVELS[Math.min(Math.floor(next.points / 150), LEVELS.length - 1)]
    const updated = { ...next, badges: [...next.badges, ...earned], level }
    persist(updated)
    set(updated)
    earned.forEach((b) => get().addToast(`Badge earned: ${b}`))
    if (earned.length > 0) get().addToast('success-chime')
    if (current.level && current.level !== updated.level) get().addToast('level-up')
  },
}))
