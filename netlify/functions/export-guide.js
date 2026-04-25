export async function handler(event) {
  const { issueUrl, username } = JSON.parse(event.body || '{}')
  const guide = `# FIRST PR Export Guide

Contributor: ${username || 'anonymous'}
Issue: ${issueUrl || 'not provided'}

## Commands
git clone <fork-url>
git checkout -b fix/first-pr
git add .
git commit -m "fix: complete first contribution"
git push origin fix/first-pr

## Checklist
- Keep PR small and focused
- Add tests/docs requested by maintainers
- Respond to feedback within 24h
`
  return { statusCode: 200, body: JSON.stringify({ guide }) }
}
