import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { APPLICATION_STATUSES } from '../types'
import { STATUS_LABELS } from '../utils/labels'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it.each(APPLICATION_STATUSES)('renders a human label for %s', (status) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(STATUS_LABELS[status])).toBeInTheDocument()
  })
})
