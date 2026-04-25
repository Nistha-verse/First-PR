import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6 text-center">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">404</h1>
        <p className="text-muted">The repository you're looking for has disappeared... like magic.</p>
        <Link to="/" className="inline-block rounded-md border border-border px-4 py-2 text-sm">
          Return home
        </Link>
      </div>
    </main>
  )
}
