import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = process.env;

describe('auth config', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('findUserByEmail returns demo user', async () => {
    const { findUserByEmail } = await import('@/lib/auth/config');
    const user = findUserByEmail('demo@bedtime-ahana.com');
    expect(user).toBeDefined();
    expect(user?.id).toBe('user-demo');
    expect(user?.subscription).toBe('free');
  });

  it('findUserByEmail returns undefined for unknown email', async () => {
    const { findUserByEmail } = await import('@/lib/auth/config');
    expect(findUserByEmail('unknown@test.com')).toBeUndefined();
  });

  it('createUser creates a new user', async () => {
    const { createUser, findUserByEmail } = await import('@/lib/auth/config');
    const user = createUser('new@test.com', 'password123');
    expect(user.id).toBeTruthy();
    expect(user.email).toBe('new@test.com');
    expect(user.subscription).toBe('free');

    const found = findUserByEmail('new@test.com');
    expect(found).toBeDefined();
    expect(found?.id).toBe(user.id);
  });

  it('createUser hashes the password', async () => {
    const { createUser } = await import('@/lib/auth/config');
    const user = createUser('hash@test.com', 'mypassword');
    expect(user.password).not.toBe('mypassword');
    expect(user.password.startsWith('$2')).toBe(true);
  });

  it('authOptions has credentials provider', async () => {
    const { authOptions } = await import('@/lib/auth/config');
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.session?.strategy).toBe('jwt');
    expect(authOptions.pages?.signIn).toBe('/login');
  });
});

describe('register API route', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const makeRequest = (body: unknown): Request =>
    new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  it('returns 400 for missing fields', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(makeRequest({ email: 'a@b.com', password: '123' }));
    expect(res.status).toBe(400);
  });

  it('returns 201 for valid registration', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(makeRequest({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
    }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.email).toContain('@example.com');
    expect(data.id).toBeTruthy();
  });

  it('returns 409 for duplicate email', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const email = `dup-${Date.now()}@example.com`;
    await POST(makeRequest({ email, password: 'password123' }));
    const res = await POST(makeRequest({ email, password: 'password456' }));
    expect(res.status).toBe(409);
  });
});
