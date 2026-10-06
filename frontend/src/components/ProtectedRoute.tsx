import { Navigate, Outlet, useLocation } from 'react-router'

import { useCurrentUser } from '../hooks/useAuth'
import { ErrorState, LoadingState } from './States'

/** Renders child routes only for an authenticated user; otherwise redirects to /login. */
export function ProtectedRoute() {
  const { data: user, isPending, error, refetch } = useCurrentUser()
  const location = useLocation()

  if (isPending) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Login/register pages: bounce already-authenticated users to the dashboard. */
export function GuestOnlyRoute() {
  const { data: user, isPending } = useCurrentUser()
  if (isPending) return <LoadingState />
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
