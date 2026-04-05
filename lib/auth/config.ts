import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync, hashSync } from 'bcryptjs';

// In-memory user store for POC (replaced by DB in production)
type StoredUser = {
  id: string;
  email: string;
  password: string;
  subscription: 'free' | 'starter' | 'family' | 'premium';
};

const users: StoredUser[] = [
  {
    id: 'user-demo',
    email: 'demo@bedtime-ahana.com',
    password: hashSync('demo1234', 10),
    subscription: 'free',
  },
];

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.find((u) => u.email === email);
}

export function createUser(email: string, password: string): StoredUser {
  const user: StoredUser = {
    id: `user-${Date.now().toString(36)}`,
    email,
    password: hashSync(password, 10),
    subscription: 'free',
  };
  users.push(user);
  return user;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = findUserByEmail(credentials.email);
        if (!user) return null;
        if (!compareSync(credentials.password, user.password)) return null;

        return {
          id: user.id,
          email: user.email,
          subscription: user.subscription,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.subscription = (user as StoredUser).subscription ?? 'free';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).subscription = token.subscription;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'bedtime-ahana-dev-secret-change-in-prod',
};
