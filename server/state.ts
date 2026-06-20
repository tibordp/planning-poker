import type { SessionState } from "../src/types";

type GlobalSessions = Record<string, SessionState>;

const GLOBAL_KEY = Symbol.for("8DC9EFA5-BAC9-4C50-A08F-62CE968F13E9");

// The session store lives on the global object so that it is shared between the
// custom WebSocket server and the Next.js API routes, which run in the same
// process.
const store = globalThis as unknown as { [key: symbol]: GlobalSessions | undefined };

if (!store[GLOBAL_KEY]) {
  store[GLOBAL_KEY] = {};
}

export const state: GlobalSessions = store[GLOBAL_KEY]!;
