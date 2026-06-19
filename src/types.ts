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

import type { CSSProperties } from "react";

/** A `Date` over the wire becomes an ISO string after JSON serialization. */
export type DateLike = string | number | Date;

export interface Settings {
  scoreSet: string[];
  allowParticipantControl: boolean;
  allowParticipantPagination: boolean;
  allowParticipantAddDelete: boolean;
  allowOpenVoting: boolean;
  showTimer: boolean;
}

export interface ScorePreset {
  type: string;
  name: string;
  scores: string[];
}

export interface TimerState {
  startTime: DateLike;
  pausedTime: DateLike | null;
  pausedTotal: number;
}

/** A score keyed by participant name. */
export type Votes = Record<string, string>;

// ---------------------------------------------------------------------------
// Client -> server actions (mirror of server/constants.ts `actionSchema`).
// ---------------------------------------------------------------------------

export interface ImportedSessionData {
  settings: Settings;
  pages: Array<{ description: string; votes?: unknown; duration?: unknown }>;
}

export type Action =
  | { action: "nudge" | "setHost" | "kick"; clientId: string }
  | { action: "newPage"; navigate?: boolean; description?: string }
  | { action: "navigate" | "privateNavigate" | "deletePage"; pageIndex: number }
  | { action: "setDescription"; pageIndex: number; description: string }
  | { action: "join" | "kickDisconnected"; name: string }
  | { action: "vote"; score: string | null }
  | { action: "setVotesVisible"; votesVisible: boolean }
  | { action: "setSettings"; settings: Settings }
  | { action: "importSession"; sessionData: ImportedSessionData }
  | { action: "reconnect"; epoch: number; score: string | null; name: string | null }
  | {
      action:
        | "ping"
        | "leave"
        | "resetBoard"
        | "startTimer"
        | "pauseTimer"
        | "resetTimer"
        | "finishSession";
    };

// ---------------------------------------------------------------------------
// Server -> client messages.
// ---------------------------------------------------------------------------

export interface SerializedClient {
  clientId: string;
  score: string | null;
  name: string | null;
}

export interface RemoteState {
  epoch: number;
  host: string | null;
  settings: Settings;
  finished: boolean;
  pagination: {
    pageIndex: number;
    pageCount: number;
  };
  description: string;
  timerState: TimerState;
  votesVisible: boolean;
  clients: SerializedClient[];
  disconnectedClients: Votes;
  me?: SerializedClient;
  privatePreview: number | null;
}

export interface Permissions {
  isHost: boolean;
  isActingHost: boolean;
  canEditDescription: boolean;
  canEditSettings: boolean;
  canVote: boolean;
  canPaginate: boolean;
  canAddDeletePages: boolean;
  canControlVotes: boolean;
  canSeeDisconnectedClients: boolean;
  canNudge: boolean;
  canPromoteToHost: boolean;
  canControlTimer: boolean;
  canFinishSession: boolean;
}

/** Props applied to a score Chip, produced by makeChipStyle. */
export interface ChipStyle {
  variant: "filled" | "outlined";
  style: CSSProperties;
}

/** [score, frequency] pairs for the vote distribution display. */
export type ScoreDistribution = [string, number][];

export interface ExportedSession {
  settings: Settings;
  finished: boolean;
  pages: Array<{ description: string; votes: Votes; duration: number }>;
}

/**
 * The common surface implemented by both client transports
 * (HeartbeatingWebsocket and LongPollSocket) and consumed by useRemoteState.
 */
export interface ClientSocket {
  onopen: (() => void) | null;
  onmessage: ((message: ServerMessage) => void) | null;
  onclose: (() => void) | null;
  send(message: Action): void;
  close(): void;
}

/** Messages pushed from the server that are not full state updates. */
export type ServerMessage =
  | { action: "updateState"; value: RemoteState; serverTime: DateLike }
  | { action: "finished"; serverTime: DateLike }
  | { action: "error"; error: string; serverTime: DateLike }
  | { action: "pong"; serverTime: DateLike }
  | { action: "nudge"; serverTime: DateLike }
  | { action: "kicked"; serverTime: DateLike };

// ---------------------------------------------------------------------------
// Server-internal state (lives only in the Node process; never serialized
// directly to clients — see server/serialization.ts).
// ---------------------------------------------------------------------------

/** The minimal socket surface the session logic relies on (ws + long-poll). */
export interface ServerSocket {
  send(data: string): void;
  close(): void;
  terminate(): void;
  // ws.WebSocket and the long-poll EventEmitter expose differently-typed
  // listeners; the server only needs a permissive shape here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): void;
}

export interface Page {
  description: string;
  timerState: TimerState;
  votes: Votes;
}

export interface ClientState {
  useHeartbeat: boolean;
  session: SessionState;
  clientId: string;
  socket: ServerSocket;
  privatePreview: number | null;
  score: string | null;
  name: string | null;
  lastHeartbeat: ReturnType<typeof setTimeout> | null;
}

export interface SessionState {
  sessionName: string;
  description: string;
  ttlTimer: ReturnType<typeof setTimeout> | null;
  finished: boolean;
  settings: Settings;
  pagination: {
    pages: Page[];
    pageIndex: number;
  };
  timerState: TimerState;
  votesVisible: boolean;
  host: string | null;
  epoch: number;
  clients: Record<string, ClientState>;
}
