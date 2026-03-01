import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        await db.user.upsert({
          where: { googleId: account.providerAccountId },
          update: {
            name: user.name ?? '',
            avatarUrl: user.image ?? null,
          },
          create: {
            googleId: account.providerAccountId,
            email: user.email,
            name: user.name ?? '',
            avatarUrl: user.image ?? null,
          },
        });
      }
      return true;
    },
    async jwt({ token, account }) {
      // Persist Google access token on initial sign-in
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        const dbUser = await db.user.findUnique({
          where: { googleId: token.sub },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          (session.user as any).alias = dbUser.alias;
          (session.user as any).residence = dbUser.residence;
        }
      }
      // Expose access token so server-side API routes can call Google Photos Picker
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
};
