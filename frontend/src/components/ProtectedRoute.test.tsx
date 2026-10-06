import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { jsonResponse, renderWithProviders } from '../test/utils'
import { ProtectedRoute } from './ProtectedRoute'

function renderRoutes() {
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<p>Login page</p>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<p>Secret dashboard</p>} />
      </Route>
    </Routes>,
  )
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('redirects to /login when the session is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(401, { detail: 'Not authenticated' })),
    )
    renderRoutes()
    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Secret dashboard')).not.toBeInTheDocument()
  })

  it('renders the protected page for an authenticated user', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(200, { id: 1, email: 'a@example.com', created_at: '2026-10-01T00:00:00Z' }),
        ),
    )
    renderRoutes()
    expect(await screen.findByText('Secret dashboard')).toBeInTheDocument()
  })
})
