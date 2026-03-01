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
          scope: 'openid email profile',
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
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
};
