import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { applicationsApi } from '../services/api'
import type { ApplicationInput } from '../types'

export const applicationKeys = {
  all: ['applications'] as const,
  list: () => [...applicationKeys.all, 'list'] as const,
  detail: (id: number) => [...applicationKeys.all, 'detail', id] as const,
  summary: () => [...applicationKeys.all, 'summary'] as const,
}

export function useApplications() {
  return useQuery({ queryKey: applicationKeys.list(), queryFn: applicationsApi.list })
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationsApi.get(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}

export function useApplicationSummary() {
  return useQuery({ queryKey: applicationKeys.summary(), queryFn: applicationsApi.summary })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ApplicationInput) => applicationsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: applicationKeys.all }),
  })
}

export function useUpdateApplication(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ApplicationInput>) => applicationsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(applicationKeys.detail(id), updated)
      return queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => applicationsApi.remove(id),
    // Only refresh list + summary: the detail page is still mounted until the
    // caller navigates away, and invalidating it would refetch a deleted id (404).
    // Its cache entry becomes inactive after navigation and is garbage-collected.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: applicationKeys.list() }),
        queryClient.invalidateQueries({ queryKey: applicationKeys.summary() }),
      ]),
  })
}
