import { Route, Routes } from 'react-router'

import { Layout } from './components/Layout'
import { GuestOnlyRoute, ProtectedRoute } from './components/ProtectedRoute'
import { ApplicationDetailPage } from './pages/ApplicationDetailPage'
import { ApplicationEditPage } from './pages/ApplicationEditPage'
import { ApplicationNewPage } from './pages/ApplicationNewPage'
import { ApplicationsListPage } from './pages/ApplicationsListPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="applications" element={<ApplicationsListPage />} />
          <Route path="applications/new" element={<ApplicationNewPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="applications/:id/edit" element={<ApplicationEditPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
