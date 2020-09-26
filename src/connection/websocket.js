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
import ReconnectingWebSocket from "reconnecting-websocket";

export class HeartbeatingWebsocket {
  constructor(url, pingInterval, heartbeatTimeout) {
    this._pingInterval = pingInterval || 5000;
    this._heartbeatTimeout = heartbeatTimeout || 10000;
    this._socket = new ReconnectingWebSocket(url);
    this._socket.onopen = this._initializeConnection.bind(this);
    this._socket.onmessage = this._handleMessage.bind(this);
    this._socket.onclose = this._closeConnection.bind(this);
    this._heartbeat = null;
    this._pinger = null;
    this._open = false;
    this.onmessage = null;
    this.onclose = null;
    this.onopen = null;
  }

  close() {
    this._socket.close();
  }

  send(message) {
    this._socket.send(JSON.stringify(message));
  }

  _setHeartbeat() {
    clearTimeout(this._heartbeat);
    this._heartbeat = setTimeout(() => {
      this._socket.reconnect();
    }, this._heartbeatTimeout);
  }

  _handleMessage(evt) {
    const message = JSON.parse(evt.data);
    this._setHeartbeat();
    switch (message.action) {
      case "pong":
        break;
      default:
        this.onmessage?.(message);
        break;
    }
  }

  _closeConnection() {
    if (this._open) {
      this._open = false;
      clearTimeout(this._heartbeat);
      clearInterval(this._pinger);
      this.onclose?.();
    }
  }

  _initializeConnection() {
    this._open = true;
    this._pinger = setInterval(() => {
      this.send({ action: "ping" });
    }, this._pingInterval);
    this.onopen?.();
  }
}
