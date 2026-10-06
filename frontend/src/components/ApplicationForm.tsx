import { useState, type FormEvent, type ReactNode } from 'react'

import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  type Application,
  type ApplicationInput,
} from '../types'
import { EMPLOYMENT_TYPE_LABELS, STATUS_LABELS } from '../utils/labels'

interface ApplicationFormProps {
  initial?: Application
  submitLabel: string
  pending?: boolean
  serverError?: string | null
  onSubmit: (data: ApplicationInput) => void
  onCancel: () => void
}

type FormState = Record<keyof ApplicationInput, string>

function toFormState(app?: Application): FormState {
  return {
    company: app?.company ?? '',
    position: app?.position ?? '',
    location: app?.location ?? '',
    job_url: app?.job_url ?? '',
    status: app?.status ?? 'SAVED',
    date_applied: app?.date_applied ?? '',
    salary: app?.salary ?? '',
    employment_type: app?.employment_type ?? '',
    notes: app?.notes ?? '',
  }
}

function toInput(form: FormState): ApplicationInput {
  const orNull = (value: string) => (value.trim() === '' ? null : value.trim())
  return {
    company: form.company.trim(),
    position: form.position.trim(),
    location: orNull(form.location),
    job_url: orNull(form.job_url),
    status: form.status as ApplicationInput['status'],
    date_applied: orNull(form.date_applied),
    salary: orNull(form.salary),
    employment_type: orNull(form.employment_type) as ApplicationInput['employment_type'],
    notes: orNull(form.notes),
  }
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {}
  if (!form.company.trim()) errors.company = 'Company is required'
  if (!form.position.trim()) errors.position = 'Position is required'
  if (form.job_url.trim() && !/^https?:\/\/\S+$/i.test(form.job_url.trim())) {
    errors.job_url = 'Enter a full URL starting with http:// or https://'
  }
  return errors
}

export function ApplicationForm({
  initial,
  submitLabel,
  pending = false,
  serverError,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const set = (field: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(toInput(form))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-6">
      {serverError && (
        <div role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">
          {serverError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Company"
          required
          value={form.company}
          onChange={set('company')}
          error={errors.company}
        />
        <TextField
          label="Position"
          required
          value={form.position}
          onChange={set('position')}
          error={errors.position}
        />
        <TextField
          label="Location"
          value={form.location}
          onChange={set('location')}
          placeholder="e.g. Toronto, ON / Remote"
        />
        <TextField
          label="Job URL"
          type="url"
          value={form.job_url}
          onChange={set('job_url')}
          error={errors.job_url}
          placeholder="https://"
        />

        <SelectField label="Status" value={form.status} onChange={set('status')}>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Date applied"
          type="date"
          value={form.date_applied}
          onChange={set('date_applied')}
        />

        <SelectField
          label="Employment type"
          value={form.employment_type}
          onChange={set('employment_type')}
        >
          <option value="">—</option>
          {EMPLOYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EMPLOYMENT_TYPE_LABELS[type]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Salary"
          value={form.salary}
          onChange={set('salary')}
          placeholder="e.g. $40/hr"
        />
      </div>

      <label className="block">
        <span className="field-label">Notes</span>
        <textarea
          className="field-input min-h-28"
          value={form.notes}
          onChange={(e) => set('notes')(e.target.value)}
        />
      </label>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={pending}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  error?: string
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
  error,
}: TextFieldProps) {
  const errorId = `${label.replace(/\s+/g, '-').toLowerCase()}-error`
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      <input
        type={type}
        className={`field-input ${error ? 'border-rose-400' : ''}`}
        value={value}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <span id={errorId} className="mt-1 block text-sm text-rose-600">
          {error}
        </span>
      )}
    </label>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}

function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select className="field-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </label>
  )
}
