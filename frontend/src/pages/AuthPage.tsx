import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { useLogin, useRegister } from '../hooks/useAuth'

/** Shared login / register screen; `mode` picks the mutation and copy. */
export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isLogin = mode === 'login'
  const login = useLogin()
  const register = useRegister()
  const mutation = isLogin ? login : register

  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate(
      { email, password },
      { onSuccess: () => navigate(redirectTo, { replace: true }) },
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold text-indigo-700">Internship Tracker</h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          {isLogin ? 'Log in to your account' : 'Create an account to start tracking'}
        </p>

        <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
          {mutation.error && (
            <div role="alert" className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">
              {mutation.error.message}
            </div>
          )}
          <label className="block">
            <span className="field-label">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="field-label">Password</span>
            <input
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              minLength={isLogin ? undefined : 8}
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && (
              <span className="mt-1 block text-xs text-slate-500">At least 8 characters.</span>
            )}
          </label>
          <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {isLogin ? (
            <>
              No account?{' '}
              <Link to="/register" className="font-medium text-indigo-700 hover:underline">
                Register
              </Link>
            </>
          ) : (
            <>
              Already registered?{' '}
              <Link to="/login" className="font-medium text-indigo-700 hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
