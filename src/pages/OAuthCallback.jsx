import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAppStore } from '../store/useAppStore'

export default function OAuthCallback() {
  const code = new URLSearchParams(window.location.search).get('code')
  const [msg, setMsg] = useState(code ? 'Authorizing with GitHub...' : 'Missing OAuth code')
  const navigate = useNavigate()
  const setAuth = useAppStore((s) => s.setAuth)

  useEffect(() => {
    if (!code) return
    api.exchangeCode(code)
      .then((data) => {
        setAuth({ token: data.token, username: data.username })
        navigate('/', { replace: true })
      })
      .catch((e) => setMsg(e.message))
  }, [code, navigate, setAuth])

  return <main className="grid min-h-screen place-items-center bg-bg text-sm">{msg}</main>
}
