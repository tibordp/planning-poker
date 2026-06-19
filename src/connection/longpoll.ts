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
import { Buffer } from "buffer";
import type { Action, ClientSocket, ServerMessage } from "../types";

export class LongPollSocket implements ClientSocket {
  private _heartbeatTimeout: number;
  private _reconnectDelay: number;
  private _heartbeat: ReturnType<typeof setTimeout> | null;
  private _active: boolean;
  private _disconnecting: boolean;
  private _urlPrefix: string;
  private _parameters: Record<string, string>;
  private _socketId: string | null;
  private _queuedMessages: Action[];
  private _abortController: AbortController | null;

  onmessage: ((message: ServerMessage) => void) | null;
  onclose: (() => void) | null;
  onopen: (() => void) | null;

  constructor(
    urlPrefix: string,
    parameters: Record<string, string>,
    heartbeatTimeout?: number,
    reconnectDelay?: number
  ) {
    this._heartbeatTimeout = heartbeatTimeout || 10000;
    this._reconnectDelay = reconnectDelay || 1000;
    this._heartbeat = null;
    this.onmessage = null;
    this.onclose = null;
    this.onopen = null;

    this._active = true;
    this._disconnecting = false;
    this._urlPrefix = urlPrefix;
    this._parameters = parameters;
    this._socketId = null;
    this._queuedMessages = [];
    this._abortController = null;
    window.addEventListener("unload", this._tryDisconnect.bind(this));
    setTimeout(() => this._handleConnection(), 0);
  }

  private _generateUrl(suffix: string, params: Record<string, string>): string {
    const url = new URL(suffix, this._urlPrefix);
    url.search = new URLSearchParams(params).toString();
    return url.toString();
  }

  private _setHeartbeat(): void {
    if (this._heartbeat) {
      clearTimeout(this._heartbeat);
    }
    this._heartbeat = setTimeout(() => {
      this._doTerminate();
    }, this._heartbeatTimeout);
  }

  private async _handleConnection(): Promise<void> {
    while (this._active) {
      this._abortController = new AbortController();
      this._setHeartbeat();
      try {
        const res = await fetch(this._generateUrl("connect", this._parameters), {
          method: "POST",
          signal: this._abortController.signal,
          body: "",
        });
        this._socketId = await res.text();
        this._setHeartbeat();
        this.onopen?.();
      } catch (e) {
        console.error("Could not connect!", e);
      }

      if (this._socketId) {
        while (this._queuedMessages.length !== 0) {
          this._doSend(this._queuedMessages.shift()!);
        }

        for (;;) {
          try {
            const res = await fetch(this._generateUrl("poll", { socket_id: this._socketId }), {
              signal: this._abortController.signal,
            });
            this._setHeartbeat();

            if (res.ok) {
              const messages: string[] = await res.json();
              messages.forEach((element) => {
                const message: ServerMessage = JSON.parse(Buffer.from(element, "base64").toString());
                this.onmessage?.(message);
              });
            } else if (res.status === 410) {
              // Connection closed gracefully.
              break;
            } else {
              throw new Error(res.statusText);
            }
          } catch (e) {
            // We may end up here because e.g. page is unloading - that's why call
            // the disconnect API with sendBeacon, to maximize the chance of the session
            // not lingering on the server.
            console.error(e);
            this._tryDisconnect();
            break;
          }
        }

        this._socketId = null;
      }

      this._disconnecting = false;
      if (this._heartbeat) {
        clearTimeout(this._heartbeat);
      }
      this._abortController = null;
      this.onclose?.();
      if (this._active) {
        console.warn(`Connection lost, reconnecting in ${this._reconnectDelay}ms`);
        await new Promise((resolve) => setTimeout(resolve, this._reconnectDelay));
      }
    }
  }

  private _tryDisconnect(): void {
    if (this._socketId && !this._disconnecting) {
      this._disconnecting = true;
      navigator.sendBeacon(this._generateUrl("disconnect", { socket_id: this._socketId }));
    }
  }

  private _doTerminate(): void {
    if (this._abortController) {
      this._abortController.abort();
    }
  }

  /**
   * Terminates the in-flight poll and sends best-effort disconnection afterwards
   */
  terminate(): void {
    this._active = false;
    this._doTerminate();
  }

  /**
   * Gracefully disconnects, waiting for server to send 410 on an existing poll
   */
  close(): void {
    this._active = false;
    this._tryDisconnect();
  }

  send(message: Action): void {
    if (this._socketId) {
      this._doSend(message);
    } else {
      this._queuedMessages.push(message);
    }
  }

  private async _doSend(message: Action): Promise<void> {
    try {
      const res = await fetch(this._generateUrl("send", { socket_id: this._socketId! }), {
        method: "POST",
        body: JSON.stringify(message),
        signal: this._abortController?.signal,
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
    } catch (e) {
      console.error(e);
      this._tryDisconnect();
    }
  }
}
