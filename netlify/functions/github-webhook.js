import crypto from 'node:crypto'
import { gh, groq } from './_lib/github'
import { publish } from './_lib/bus'

const getRawBody = (event) => {
  if (event.isBase64Encoded) {
    return Buffer.from(event.body || '', 'base64')
  }
  return Buffer.from(event.body || '', 'utf8')
}

const verifySignature = (rawBodyBuffer, signature) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (!secret) throw new Error('Missing GITHUB_WEBHOOK_SECRET')
  if (!signature) throw new Error('Missing webhook signature header')

  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBodyBuffer).digest('hex')}`
  const expectedBuf = Buffer.from(expected, 'utf8')
  const sigBuf = Buffer.from(signature, 'utf8')
  if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
    throw new Error('Invalid webhook signature')
  }
}

const analyzePatch = async (patch) => {
  const prompt = `You are a strict PR reviewer. Detect null checks, undefined variables, typos, and style issues from this diff. Return JSON array warnings: [{file,line,message}]. Diff:\n${patch.slice(0, 12000)}`
  const content = await groq(prompt)
  const json = content.match(/\[[\s\S]*\]/)?.[0]
  return json ? JSON.parse(json) : []
}

export async function handler(event) {
  try {
    const signature = event.headers['x-hub-signature-256'] || event.headers['X-Hub-Signature-256']
    const rawBodyBuffer = getRawBody(event)
    verifySignature(rawBodyBuffer, signature)
    const payload = JSON.parse(rawBodyBuffer.toString('utf8') || '{}')
    if (!payload.pull_request) return { statusCode: 200, body: JSON.stringify({ ok: true }) }

    const owner = payload.repository.owner.login
    const repo = payload.repository.name
    const num = payload.pull_request.number
    const user = payload.pull_request.user.login
    const token = process.env.GITHUB_API_TOKEN
    const files = await gh(`/repos/${owner}/${repo}/pulls/${num}/files`, token)
    const patch = files.map((f) => `FILE:${f.filename}\n${f.patch || ''}`).join('\n')
    const lines = await analyzePatch(patch)
    const message = {
      type: lines.length ? 'warning' : 'ready',
      title: payload.pull_request.title,
      repo: `${owner}/${repo}`,
      sha: payload.pull_request.head.sha,
      lines,
    }
    publish(user, message)
    return { statusCode: 200, body: JSON.stringify({ ok: true, warnings: lines.length }) }
  } catch (error) {
    return { statusCode: 401, body: JSON.stringify({ error: error.message }) }
  }
}
