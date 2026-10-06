import type { ApplicationStatus } from '../types'
import { STATUS_LABELS } from '../utils/labels'

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  SAVED: 'bg-slate-100 text-slate-700 ring-slate-300',
  APPLIED: 'bg-blue-50 text-blue-700 ring-blue-200',
  OA: 'bg-violet-50 text-violet-700 ring-violet-200',
  INTERVIEW: 'bg-amber-50 text-amber-800 ring-amber-200',
  OFFER: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200',
  WITHDRAWN: 'bg-zinc-100 text-zinc-600 ring-zinc-300',
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
