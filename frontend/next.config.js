/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  // Enable experimental features for standalone output needed for Docker
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'cloudflare-ipfs.com', 'avatars.githubusercontent.com', 'source.unsplash.com'],
  },
  // Disable the App Router if this project is still using Pages Router
  // Set this to true if you're using App Router
  experimental: {
    appDir: true,
  },
  // Enable API rewrites to proxy requests to the backend
  async rewrites() {
    return [
      // Exclude auth routes from direct proxy to ensure CSRF token handling
      {
        source: '/api/:path*',
        destination: '/api/:path*',
        has: [
          {
            type: 'header',
            key: 'x-use-local-api',
            value: 'true'
          }
        ]
      },
      // Don't directly proxy auth endpoints, let them go through our Next.js API routes
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*'
      },
      // Proxy all other API requests to the backend
      {
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` : 'http://localhost:3001/:path*',
      }
    ]
  },
  // Disable automatic static optimization for all pages
  // This is important to ensure that the API routes are properly handled
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          // Add security headers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
  // Add compiler options for faster builds
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Improve webpack configurations
  webpack: (config, { isServer }) => {
    return config;
  },
}

module.exports = nextConfig; 