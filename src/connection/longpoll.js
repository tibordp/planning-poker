import { Buffer } from "buffer";

export class LongPollSocket {
  constructor(urlPrefix, parameters, heartbeatTimeout) {
    this._heartbeatTimeout = heartbeatTimeout || 10000;
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
    window.addEventListener("unload", this._tryDisconnect.bind(this));
    setTimeout(() => this._handleConnection(), 0);
  }

  _generateUrl(suffix, params) {
    const url = new URL(suffix, this._urlPrefix);
    url.search = new URLSearchParams(params).toString();
    return url.toString();
  }

  _setHeartbeat() {
    clearTimeout(this._heartbeat);
    this._heartbeat = setTimeout(() => {
      this._doTerminate();
    }, this._heartbeatTimeout);
  }

  async _handleConnection() {
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
        console.log("Could not connect!", e);
      }

      if (this._socketId) {
        while (this._queuedMessages.length !== 0) {
          this._doSend(this._queuedMessages.shift());
        }

        for (;;) {
          try {
            const res = await fetch(this._generateUrl("poll", { socket_id: this._socketId }), {
              signal: this._abortController.signal,
            });
            this._setHeartbeat();

            if (res.ok) {
              const messages = await res.json();
              messages.forEach((element) => {
                const message = JSON.parse(Buffer.from(element, "base64").toString());
                this.onmessage?.(message);
              });
            } else {
              // Connection closed gracefully.
              break;
            }
          } catch (e) {
            // We may end up here because e.g. page is unloading - that's why call
            // the disconnect API with sendBeacon, to maximize the chance of the session
            // not lingering on the server.
            console.log(e);
            this._tryDisconnect();
            break;
          }
        }

        this._socketId = null;
      }

      this._disconnecting = false;
      clearTimeout(this._heartbeat);
      this._abortController = null;
      this.onclose?.();
      if (this._active) {
        console.log("Reconnecting in X seconds");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  _tryDisconnect() {
    if (this._socketId && !this._disconnecting) {
      this._disconnecting = true;
      navigator.sendBeacon(this._generateUrl("disconnect", { socket_id: this._socketId }));
    }
  }

  _doTerminate() {
    if (this._abortController) {
      this._abortController.abort();
    }
  }

  /**
   * Terminates the in-flight poll and sends best-effort disconnection afterwards
   */
  terminate() {
    this._active = false;
    this._doTerminate();
  }

  /**
   * Gracefully disconnects, waiting for server to send 410 on an existing poll
   */
  close() {
    this._active = false;
    this._tryDisconnect();
  }

  send(message) {
    if (this._socketId) {
      this._doSend(message);
    } else {
      this._queuedMessages.push(message);
    }
  }

  _doSend(message) {
    return fetch(this._generateUrl("send", { socket_id: this._socketId }), {
      method: "POST",
      body: JSON.stringify(message),
    });
  }
}
