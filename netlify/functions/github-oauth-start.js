export async function handler() {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) return { statusCode: 500, body: JSON.stringify({ error: 'Missing GITHUB_CLIENT_ID' }) }
  const redirect = encodeURIComponent(`${process.env.URL || 'http://localhost:8888'}/auth/callback`)
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo read:user&redirect_uri=${redirect}`
  return { statusCode: 200, body: JSON.stringify({ url }) }
}
