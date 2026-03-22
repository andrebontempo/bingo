/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removido para suportar o SSR do "npm run start" nativo no Docker
  trailingSlash: true,
};

export default nextConfig;
