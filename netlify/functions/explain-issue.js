import { groq } from './_lib/github'

export async function handler(event) {
  try {
    const issue = JSON.parse(event.body || '{}')
    const prompt = `Explain this GitHub issue for a beginner. Give plain English steps, likely file to edit, and exact change hints.\nTitle: ${issue.title}\nBody: ${issue.body}\nURL:${issue.url}`
    const explanation = await groq(prompt)
    return { statusCode: 200, body: JSON.stringify({ explanation }) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}
