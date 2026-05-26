'use client'

import { useActionState } from 'react'
import { signIn } from './actions'

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(signIn, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment">
      <div className="w-full max-w-sm bg-paper border border-border rounded p-8">
        <h1 className="text-xl font-bold font-serif text-ink mb-6">
          WXDA Admin Sign In
        </h1>

        {error && (
          <p className="mb-4 text-sm text-crimson bg-crimson/10 border border-crimson/30 rounded px-3 py-2">
            {error}
          </p>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1 text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 text-sm rounded border border-border bg-paper text-ink"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1 text-ink">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 text-sm rounded border border-border bg-paper text-ink"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 text-sm font-semibold rounded bg-crimson text-on-accent transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isPending ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
