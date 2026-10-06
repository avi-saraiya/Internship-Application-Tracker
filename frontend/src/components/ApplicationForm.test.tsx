import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Application } from '../types'
import { ApplicationForm } from './ApplicationForm'

function setup(initial?: Application) {
  const onSubmit = vi.fn()
  render(
    <ApplicationForm initial={initial} submitLabel="Save" onSubmit={onSubmit} onCancel={vi.fn()} />,
  )
  return { onSubmit, user: userEvent.setup() }
}

describe('ApplicationForm', () => {
  it('shows required-field errors and does not submit when empty', async () => {
    const { onSubmit, user } = setup()
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Company is required')).toBeInTheDocument()
    expect(screen.getByText('Position is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a malformed job URL', async () => {
    const { onSubmit, user } = setup()
    await user.type(screen.getByLabelText(/Company/), 'Shopify')
    await user.type(screen.getByLabelText(/Position/), 'Intern')
    await user.type(screen.getByLabelText('Job URL'), 'shopify.com/jobs')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText(/full URL/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a trimmed payload with blanks converted to null', async () => {
    const { onSubmit, user } = setup()
    await user.type(screen.getByLabelText(/Company/), '  Shopify  ')
    await user.type(screen.getByLabelText(/Position/), 'SWE Intern')
    await user.selectOptions(screen.getByLabelText('Status'), 'APPLIED')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({
      company: 'Shopify',
      position: 'SWE Intern',
      location: null,
      job_url: null,
      status: 'APPLIED',
      date_applied: null,
      salary: null,
      employment_type: null,
      notes: null,
    })
  })

  it('pre-fills values when editing', () => {
    setup({
      id: 1,
      company: 'Stripe',
      position: 'Backend Intern',
      location: 'Remote',
      job_url: null,
      status: 'INTERVIEW',
      date_applied: '2026-09-01',
      salary: null,
      employment_type: 'INTERNSHIP',
      notes: 'Round 2 next week',
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    })
    expect(screen.getByLabelText(/Company/)).toHaveValue('Stripe')
    expect(screen.getByLabelText('Status')).toHaveValue('INTERVIEW')
    expect(screen.getByLabelText('Notes')).toHaveValue('Round 2 next week')
  })
})
