// Browser-facing API surface exposed by the app for third-party integrations
// (userscripts etc.) plus the global server/client time offset.
import type { RemoteState, Action } from "@/src/types";
import type { RuntimeConfig } from "@/src/config";

declare global {
  interface Window {
    __PP_TIME_OFFSET?: number;
    __PP_SESSION_NAME?: string;
    __PP_STATE?: RemoteState | null;
    __PP_DISPATCH?: (action: Action) => void;
    __PP_CONFIG?: RuntimeConfig;
  }
}

export {};
