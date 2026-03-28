'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12" data-testid="login-page">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="input-email"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="input-password"
          />
        </div>

        {error && <p className="text-xs text-red-500" data-testid="login-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90 disabled:opacity-50"
          data-testid="login-button"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        No account?{' '}
        <Link href="/register" className="text-brand-primary hover:underline" data-testid="register-link">
          Register
        </Link>
      </p>
    </div>
  );
}
