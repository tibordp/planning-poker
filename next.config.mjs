/** @type {import('next').NextConfig} */
const nextConfig = {
  // Runtime configuration (long-polling toggle, heartbeat timings) is exposed to
  // the browser by the custom server via pages/_document.tsx, since Next.js 16
  // removed `publicRuntimeConfig`. See src/config.ts.
  // Kept false to preserve the original app's behavior (the WebSocket connect
  // effect predates React Strict Mode's double-invocation in development).
  reactStrictMode: false,
};

export default nextConfig;
