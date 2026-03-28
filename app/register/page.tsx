'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Registration failed');
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Registration succeeded but sign-in failed. Please log in.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12" data-testid="register-page">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500">Start creating personalized books</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="input-email"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="input-password"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="reg-confirm">Confirm Password</label>
          <input
            id="reg-confirm"
            type="password"
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            data-testid="input-confirm"
          />
        </div>

        {error && <p className="text-xs text-red-500" data-testid="register-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90 disabled:opacity-50"
          data-testid="register-button"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-primary hover:underline" data-testid="login-link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
