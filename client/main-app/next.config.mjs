/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "ui-avatars.com",
      "res.cloudinary.com",
      "www.transparenttextures.com",
      "placehold.co",
    ],
  },

  async rewrites() {
    return [
      // Student rewrites
      {
        source: "/user/profile",
        destination: "/student/profile",
      },
      {
        source: "/user/courses",
        destination: "/student/courses",
      },
      {
        source: "/user/payments",
        destination: "/student/payments",
      },
      {
        source: "/user/settings",
        destination: "/student/settings",
      },
      {
        source: "/user/public-profile",
        destination: "/student/public-profile",
      },
      {
        source: "/user/photo",
        destination: "/student/photo",
      },
      {
        source: "/user/account-security",
        destination: "/student/account-security",
      },
      {
        source: "/user/close-account",
        destination: "/student/close-account",
      },

      
      // Tutor rewrites (placeholder - actual tutor pages will be created)
      {
        source: "/tutor/dashboard",
        destination: "/tutor/dashboard",
      },
      {
        source: "/tutor/courses",
        destination: "/tutor/courses",
      },
      {
        source: "/tutor/earnings",
        destination: "/tutor/earnings",
      },
      {
        source: "/tutor/settings",
        destination: "/tutor/settings",
      },
    ];
  },
};

export default nextConfig;
