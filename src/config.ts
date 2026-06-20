/**
 * Runtime configuration exposed to the browser.
 *
 * Next.js 16 removed `publicRuntimeConfig`/`next/config`, so instead of baking
 * these into the client bundle at build time (which would break configuring
 * them per-deployment via environment variables), the custom server renders
 * them into the HTML document at request time (see pages/_document.tsx) and the
 * client reads them back from `window.__PP_CONFIG`.
 */
export interface RuntimeConfig {
  useLongPolling: boolean;
  heartbeatInterval: number;
  heartbeatTimeout: number;
}

export const defaultRuntimeConfig: RuntimeConfig = {
  useLongPolling: false,
  heartbeatInterval: 5000,
  heartbeatTimeout: 10000,
};

/** Read the runtime configuration from the environment (server-side only). */
export function readRuntimeConfig(): RuntimeConfig {
  return {
    useLongPolling: process.env.USE_LONG_POLLING === "true",
    heartbeatInterval: Number(process.env.PP_HEARTBEAT_INTERVAL) || 5000,
    heartbeatTimeout: Number(process.env.PP_HEARTBEAT_TIMEOUT) || 10000,
  };
}

/** Read the runtime configuration injected into the document (client-side). */
export function getClientConfig(): RuntimeConfig {
  if (typeof window !== "undefined" && window.__PP_CONFIG) {
    return window.__PP_CONFIG;
  }
  return defaultRuntimeConfig;
}
