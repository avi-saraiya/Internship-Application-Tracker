import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, authApi } from '../services/api'
import type { User } from '../types'

export const currentUserKey = ['auth', 'me'] as const

/** Resolves to the logged-in user, or null when there is no valid session. */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: currentUserKey,
    queryFn: async () => {
      try {
        return await authApi.me()
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => queryClient.setQueryData(currentUserKey, user),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => queryClient.setQueryData(currentUserKey, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Drop every cached query so the next user never sees stale data.
      queryClient.clear()
      queryClient.setQueryData(currentUserKey, null)
    },
  })
}
