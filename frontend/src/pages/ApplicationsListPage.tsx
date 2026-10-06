import { Link } from 'react-router'

import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { StatusBadge } from '../components/StatusBadge'
import { useApplications } from '../hooks/useApplications'
import { formatDate } from '../utils/labels'

export function ApplicationsListPage() {
  const { data: applications, isPending, error, refetch } = useApplications()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Applications</h1>
        <Link to="/applications/new" className="btn-primary">
          Add application
        </Link>
      </div>

      {isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : applications.length === 0 ? (
        <EmptyState title="No applications yet">
          <Link to="/applications/new" className="btn-primary">
            Add your first application
          </Link>
        </EmptyState>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="card hidden overflow-hidden p-0 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        to={`/applications/${app.id}`}
                        className="text-indigo-700 hover:underline"
                      >
                        {app.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{app.position}</td>
                    <td className="px-4 py-3 text-slate-600">{app.location ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(app.date_applied)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {applications.map((app) => (
              <li key={app.id}>
                <Link to={`/applications/${app.id}`} className="card block p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{app.company}</p>
                      <p className="text-sm text-slate-600">{app.position}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {app.location ?? 'No location'} · Applied {formatDate(app.date_applied)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
