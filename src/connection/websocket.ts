import ReconnectingWebSocket from "reconnecting-websocket";
import type { Action, ClientSocket, ServerMessage } from "../types";

export class HeartbeatingWebsocket implements ClientSocket {
  private _pingInterval: number;
  private _heartbeatTimeout: number;
  private _socket: ReconnectingWebSocket;
  private _heartbeat: ReturnType<typeof setTimeout> | null;
  private _pinger: ReturnType<typeof setInterval> | null;
  private _open: boolean;

  onmessage: ((message: ServerMessage) => void) | null;
  onclose: (() => void) | null;
  onopen: (() => void) | null;

  constructor(url: string, pingInterval?: number, heartbeatTimeout?: number) {
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

  close(): void {
    this._socket.close();
  }

  send(message: Action): void {
    this._socket.send(JSON.stringify(message));
  }

  private _setHeartbeat(): void {
    if (this._heartbeat) {
      clearTimeout(this._heartbeat);
    }
    this._heartbeat = setTimeout(() => {
      this._socket.reconnect();
    }, this._heartbeatTimeout);
  }

  private _handleMessage(evt: MessageEvent): void {
    const message: ServerMessage = JSON.parse(evt.data);
    this._setHeartbeat();
    switch (message.action) {
      case "pong":
        break;
      default:
        this.onmessage?.(message);
        break;
    }
  }

  private _closeConnection(): void {
    if (this._open) {
      this._open = false;
      if (this._heartbeat) {
        clearTimeout(this._heartbeat);
      }
      if (this._pinger) {
        clearInterval(this._pinger);
      }
      this.onclose?.();
    }
  }

  private _initializeConnection(): void {
    this._open = true;
    this._pinger = setInterval(() => {
      this.send({ action: "ping" });
    }, this._pingInterval);
    this.onopen?.();
  }
}
