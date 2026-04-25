import { gh, groq } from './_lib/github'

const cache = new Map()
const DAY = 24 * 60 * 60 * 1000

const parseIssue = (url) => {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/)
  if (!m) throw new Error('Invalid issue URL')
  return { owner: m[1], repo: m[2], number: m[3] }
}

export async function handler(event) {
  try {
    const auth = event.headers.authorization || event.headers.Authorization || ''
    const token = auth.replace('Bearer ', '')
    const issue = JSON.parse(event.body || '{}')
    const key = issue.url
    const cached = cache.get(key)
    if (cached && Date.now() - cached.ts < DAY) return { statusCode: 200, body: JSON.stringify(cached.data) }

    const { owner, repo, number } = parseIssue(issue.url)
    const prs = await gh(`/search/issues?q=repo:${owner}/${repo}+type:pr+${number}+in:body&per_page=20`, token)
    const summary = (prs.items || []).map((pr) => ({ title: pr.title, body: pr.body || '', state: pr.state }))
    const analysis = await groq(
      `Analyze why these PRs around issue #${number} were closed/rejected/abandoned. Return JSON with keys commonCause, riskyFiles(array), survivalTips(array), survivalChance(number). Input: ${JSON.stringify(summary)}`
    )
    const extracted = analysis.match(/\{[\s\S]*\}/)?.[0]
    const parsed = extracted ? JSON.parse(extracted) : {}
    const data = {
      totalAttempts: summary.length,
      commonCause: parsed.commonCause || 'Insufficient maintainer communication',
      riskyFiles: parsed.riskyFiles || [],
      survivalTips: parsed.survivalTips || ['Keep scope minimal', 'Ask questions early', 'Update PR quickly'],
      survivalChance: parsed.survivalChance || 60,
    }
    cache.set(key, { ts: Date.now(), data })
    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}
