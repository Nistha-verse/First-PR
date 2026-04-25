import { getSupabase } from './_lib/supabase'

export async function handler(event) {
  try {
    const user = event.queryStringParameters?.user
    const since = event.queryStringParameters?.since
    if (!user) return { statusCode: 400, body: JSON.stringify({ error: 'Missing user' }) }

    const supabase = getSupabase()
    let query = supabase
      .from('live_autopsy_events')
      .select('id,user_login,type,title,repo,sha,lines,created_at')
      .eq('user_login', user)
      .order('created_at', { ascending: false })
      .limit(20)

    if (since) query = query.gt('created_at', since)
    const { data, error } = await query
    if (error) throw error
    return { statusCode: 200, body: JSON.stringify({ events: data || [] }) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}
