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
