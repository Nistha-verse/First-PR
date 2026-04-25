import { gh } from './_lib/github'

export async function handler(event) {
  try {
    const auth = event.headers.authorization || event.headers.Authorization || ''
    const token = auth.replace('Bearer ', '')
    const skills = new URLSearchParams(event.queryStringParameters || {}).get('skills') || 'javascript'
    const q = encodeURIComponent(`is:open is:issue label:"good first issue" ${skills}`)
    const data = await gh(`/search/issues?q=${q}&sort=updated&order=desc&per_page=10`, token)
    const issues = (data.items || []).map((i) => ({
      title: i.title,
      body: i.body?.slice(0, 240) || 'No description provided.',
      url: i.html_url,
      repo: i.repository_url?.split('/repos/')[1] || 'unknown',
    }))
    return { statusCode: 200, body: JSON.stringify({ issues }) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}
