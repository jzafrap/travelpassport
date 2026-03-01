import withAuth from 'next-auth/middleware';

export const middleware = withAuth;

export const config = {
  // Protect only the auth pages, not the public /passport/[userId] share page
  matcher: ['/passport', '/globalpassport'],
};
