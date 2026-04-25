const channels = new Map()

export const publish = (token, payload) => {
  const clients = channels.get(token) || []
  const data = `data: ${JSON.stringify(payload)}\n\n`
  clients.forEach((res) => res.write(data))
}

export const subscribe = (token, res) => {
  const clients = channels.get(token) || []
  channels.set(token, [...clients, res])
}

export const unsubscribe = (token, res) => {
  const clients = channels.get(token) || []
  channels.set(token, clients.filter((c) => c !== res))
}
