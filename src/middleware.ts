export { default } from 'next-auth/middleware';
export const config = {
  matcher: ['/passport/:path*', '/globalpassport/:path*'],
};
