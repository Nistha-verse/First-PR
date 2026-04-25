import { stream } from '@netlify/functions'
import { subscribe, unsubscribe } from './_lib/bus'

export const handler = stream(async (event, responseStream) => {
  const user = event.queryStringParameters?.user
  if (!user) {
    responseStream.write(JSON.stringify({ error: 'Missing user query param' }))
    responseStream.end()
    return
  }

  responseStream.setHeader('Content-Type', 'text/event-stream')
  responseStream.setHeader('Cache-Control', 'no-cache')
  responseStream.setHeader('Connection', 'keep-alive')
  responseStream.write(`data: ${JSON.stringify({ type: 'ping', title: 'Connected' })}\n\n`)
  subscribe(user, responseStream)

  const keepAlive = setInterval(() => {
    responseStream.write(`data: ${JSON.stringify({ type: 'ping', t: Date.now() })}\n\n`)
  }, 15000)

  event.rawUrl = event.rawUrl || ''
  event.headers = event.headers || {}
  event.body = event.body || ''
  event.multiValueHeaders = event.multiValueHeaders || {}

  responseStream.on('close', () => {
    clearInterval(keepAlive)
    unsubscribe(user, responseStream)
    responseStream.end()
  })
})
