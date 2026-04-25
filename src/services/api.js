const call = async (path, options = {}) => {
  const res = await fetch(`/.netlify/functions/${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data
}

export const api = {
  getOAuthStart: () => call('github-oauth-start'),
  exchangeCode: (code) => call('github-oauth-callback', { method: 'POST', body: JSON.stringify({ code }) }),
  findIssues: (skills, token) => call(`github-issues?skills=${encodeURIComponent(skills)}`, { headers: { Authorization: `Bearer ${token}` } }),
  explainIssue: (payload, token) => call('explain-issue', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  issueAutopsy: (payload, token) => call('issue-autopsy', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  exportGuide: (payload) => call('export-guide', { method: 'POST', body: JSON.stringify(payload) }),
}
