export { default } from 'next-auth/middleware';
export const config = {
  // Protect only the auth pages, not the public /passport/[userId] share page
  matcher: ['/passport', '/globalpassport'],
};
