import { useNavigate } from 'react-router'

import { ApplicationForm } from '../components/ApplicationForm'
import { useCreateApplication } from '../hooks/useApplications'

export function ApplicationNewPage() {
  const navigate = useNavigate()
  const create = useCreateApplication()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add application</h1>
      <ApplicationForm
        submitLabel="Save application"
        pending={create.isPending}
        serverError={create.error?.message}
        onCancel={() => navigate(-1)}
        onSubmit={(data) =>
          create.mutate(data, { onSuccess: (app) => navigate(`/applications/${app.id}`) })
        }
      />
    </div>
  )
}
