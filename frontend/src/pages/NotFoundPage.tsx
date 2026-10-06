import { Link } from 'react-router'

import { EmptyState } from '../components/States'

export function NotFoundPage() {
  return (
    <EmptyState title="Page not found">
      <Link to="/" className="btn-primary">
        Go to dashboard
      </Link>
    </EmptyState>
  )
}
