export const gh = async (path, token, init = {}) => {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`GitHub API failed (${res.status}): ${msg}`)
  }
  return res.json()
}

export const groq = async (prompt) => {
  const models = [
    process.env.GROQ_MODEL,
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ].filter(Boolean)

  let lastError = 'Unknown Groq failure'

  for (const model of models) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return data.choices?.[0]?.message?.content || 'No response.'
    }

    const errText = await res.text()
    lastError = `Groq request failed: ${res.status} (${model}) ${errText}`
  }

  throw new Error(lastError)
}
