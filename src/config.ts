/**
 * MIT License
 *
 * Copyright (c) 2020 Tibor Djurica Potpara
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
