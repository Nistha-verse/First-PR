import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import OAuthCallback from './pages/OAuthCallback'
import NotFound from './pages/NotFound'

function App() {
  useEffect(() => {
    console.log('🐍 Welcome, developer. The snake is just a snake. Or is it?')
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
