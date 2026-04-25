import { gh } from './_lib/github'

export async function handler(event) {
  try {
    const { code } = JSON.parse(event.body || '{}')
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const tokenData = await res.json()
    if (!tokenData.access_token) throw new Error('OAuth token not returned')
    const me = await gh('/user', tokenData.access_token)
    return {
      statusCode: 200,
      body: JSON.stringify({ token: tokenData.access_token, username: me.login }),
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}
