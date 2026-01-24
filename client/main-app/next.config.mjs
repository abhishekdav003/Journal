/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/user/profile',
        destination: '/student/profile',
      },
      {
        source: '/user/courses',
        destination: '/student/courses',
      },
      {
        source: '/user/payments',
        destination: '/student/payments',
      },
      {
        source: '/user/settings',
        destination: '/student/settings',
      },
    ];
  },
};

export default nextConfig;