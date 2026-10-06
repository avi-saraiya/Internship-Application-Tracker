import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { ConfirmDialog } from '../components/ConfirmDialog'
import { ErrorState, LoadingState } from '../components/States'
import { StatusBadge } from '../components/StatusBadge'
import { useApplication, useDeleteApplication } from '../hooks/useApplications'
import { EMPLOYMENT_TYPE_LABELS, formatDate } from '../utils/labels'

export function ApplicationDetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data: app, isPending, error, refetch } = useApplication(id)
  const remove = useDeleteApplication()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isPending) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <Link to="/applications" className="text-sm text-indigo-700 hover:underline">
        ← All applications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{app.company}</h1>
          <p className="text-slate-600">{app.position}</p>
          <div className="mt-2">
            <StatusBadge status={app.status} />
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/applications/${app.id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <button type="button" className="btn-danger" onClick={() => setConfirmOpen(true)}>
            Delete
          </button>
        </div>
      </div>

      <dl className="card grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <Field label="Location">{app.location ?? '—'}</Field>
        <Field label="Date applied">{formatDate(app.date_applied)}</Field>
        <Field label="Employment type">
          {app.employment_type ? EMPLOYMENT_TYPE_LABELS[app.employment_type] : '—'}
        </Field>
        <Field label="Salary">{app.salary ?? '—'}</Field>
        <Field label="Job posting">
          {app.job_url ? (
            <a
              href={app.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-indigo-700 hover:underline"
            >
              {app.job_url}
            </a>
          ) : (
            '—'
          )}
        </Field>
        <Field label="Last updated">{new Date(app.updated_at).toLocaleString()}</Field>
        <div className="sm:col-span-2">
          <Field label="Notes">
            <span className="whitespace-pre-wrap">{app.notes ?? '—'}</span>
          </Field>
        </div>
      </dl>

      {remove.error && <ErrorState error={remove.error} />}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete application?"
        message={`This permanently deletes your ${app.company} application.`}
        confirmLabel="Delete"
        pending={remove.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          remove.mutate(app.id, {
            onSuccess: () => navigate('/applications', { replace: true }),
            onSettled: () => setConfirmOpen(false),
          })
        }
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  )
}
