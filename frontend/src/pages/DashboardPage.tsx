import { Link } from 'react-router'

import { ErrorState, LoadingState } from '../components/States'
import { useApplicationSummary } from '../hooks/useApplications'

export function DashboardPage() {
  const { data: summary, isPending, error, refetch } = useApplicationSummary()

  if (isPending) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  const s = summary.by_status
  const tiles = [
    { label: 'Total', value: summary.total, accent: 'text-slate-900' },
    { label: 'Applied', value: s.APPLIED, accent: 'text-blue-700' },
    { label: 'Interviews', value: s.OA + s.INTERVIEW, accent: 'text-amber-700' },
    { label: 'Offers', value: s.OFFER, accent: 'text-emerald-700' },
    { label: 'Rejected', value: s.REJECTED, accent: 'text-rose-700' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link to="/applications/new" className="btn-primary">
          Add application
        </Link>
      </div>

      <section aria-label="Application summary" className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="card p-4">
            <p className="text-sm text-slate-500">{tile.label}</p>
            <p className={`mt-1 text-3xl font-semibold ${tile.accent}`}>{tile.value}</p>
          </div>
        ))}
      </section>

      <p className="text-sm text-slate-500">
        Interviews includes online assessments. {s.SAVED} saved, {s.WITHDRAWN} withdrawn.{' '}
        <Link to="/applications" className="font-medium text-indigo-700 hover:underline">
          View all applications →
        </Link>
      </p>
    </div>
  )
}
