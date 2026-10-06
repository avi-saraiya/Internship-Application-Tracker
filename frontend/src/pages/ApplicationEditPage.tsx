import { useNavigate, useParams } from 'react-router'

import { ApplicationForm } from '../components/ApplicationForm'
import { ErrorState, LoadingState } from '../components/States'
import { useApplication, useUpdateApplication } from '../hooks/useApplications'

export function ApplicationEditPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data: application, isPending, error, refetch } = useApplication(id)
  const update = useUpdateApplication(id)

  if (isPending) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit application</h1>
      <ApplicationForm
        initial={application}
        submitLabel="Save changes"
        pending={update.isPending}
        serverError={update.error?.message}
        onCancel={() => navigate(`/applications/${id}`)}
        onSubmit={(data) =>
          update.mutate(data, { onSuccess: () => navigate(`/applications/${id}`) })
        }
      />
    </div>
  )
}
