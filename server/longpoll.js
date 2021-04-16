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

/* global BigInt */

const EventEmitter = require("events");
const { v4: uuidv4 } = require("uuid");
const { parse, URLSearchParams } = require("url");
const NS_PER_MSEC = BigInt(1000000);

class Socket extends EventEmitter {
  constructor(pollTimeout, idleTimeout) {
    super();
    const now = process.hrtime.bigint();
    this._messages = [];
    this._responses = [];
    this._pollTimeout = BigInt(pollTimeout) * NS_PER_MSEC;
    this._idleTimeout = BigInt(idleTimeout) * NS_PER_MSEC;
    this._lastPoll = now;
    this._closing = false;
    this._timer = setTimeout(() => this.check(now + this._idleTimeout), idleTimeout);
  }

  poll(res) {
    if (!this._timer) {
      throw Error("Socket closed!");
    }
    const now = process.hrtime.bigint();
    this._responses.push([now, res]);
    this._lastPoll = now;
    this.check(now);
  }

  close() {
    const now = process.hrtime.bigint();
    this._closing = true;
    this.check(now);
  }

  _doClose() {
    if (this._timer) {
      while (this._responses.length !== 0) {
        const [, res] = this._responses.shift();
        res.writeHead(410).end();
      }
      clearTimeout(this._timer);
      this.emit("close");
    }
  }

  terminate() {
    if (this._timer) {
      while (this._responses.length !== 0) {
        const [, res] = this._responses.shift();
        res.socket.destroy();
      }
      clearTimeout(this._timer);
      this.emit("close");
    }
  }

  check(now) {
    while (
      this._responses.length !== 0 &&
      (this._messages.length !== 0 || now - this._responses[0][0] >= this._pollTimeout)
    ) {
      const [, res] = this._responses.shift();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(this._messages.map((buf) => buf.toString("base64"))));
      this._messages.splice(0, this._messages.length);
    }

    const idleOutTime = this._lastPoll + this._idleTimeout;
    if ((this._messages.length === 0 && this._closing) || now >= idleOutTime) {
      this._doClose();
    } else {
      let nextCheck;
      if (this._responses.length === 0 || this._responses[0][0] + this._pollTimeout > idleOutTime) {
        nextCheck = idleOutTime;
      } else {
        nextCheck = this._responses[0][0] + this._pollTimeout;
      }

      clearTimeout(this._timer);
      this._timer = setTimeout(
        () => this.check(nextCheck),
        Number(nextCheck - now) / Number(NS_PER_MSEC)
      );
    }
  }

  send(message) {
    const now = process.hrtime.bigint();
    if (this._closing || !this._timer) {
      throw Error("Socket closed!");
    }

    this._messages.push(Buffer.from(message));
    this.check(now);
  }
}

class LongPollHandler extends EventEmitter {
  constructor(pollTimeout, idleTimeout) {
    super();
    this.sockets = {};
    this._pollTimeout = pollTimeout || 30000;
    this._idleTimeout = idleTimeout || 60000;
  }

  handle(req, res) {
    const parsedUrl = parse(req.url, true);

    if (req.method === "POST" && parsedUrl.pathname.endsWith("/connect")) {
      const socketId = uuidv4();
      const socket = new Socket(this._pollTimeout, this._idleTimeout);
      this.sockets[socketId] = socket;
      socket.on("close", () => delete this.sockets[socketId]);
      try {
        this.emit("connection", socket, req);
        res.writeHead(200, { "Content-Type": "text/plain" }).end(socketId);
      } catch (e) {
        res.writeHead(500).end();
        throw e;
      }
    } else if (req.method === "POST" && parsedUrl.pathname.endsWith("/disconnect")) {
      const socketId = new URLSearchParams(parsedUrl.search).get("socket_id");
      const socket = this.sockets[socketId];
      if (socket) {
        socket.close();
      }
      res.writeHead(200).end();
    } else if (req.method === "GET" && parsedUrl.pathname.endsWith("/poll")) {
      const socketId = new URLSearchParams(parsedUrl.search).get("socket_id");
      const socket = this.sockets[socketId];
      if (!socket) {
        res.writeHead(410).end();
      } else {
        socket.poll(res);
      }
    } else if (req.method === "POST" && parsedUrl.pathname.endsWith("/send")) {
      const socketId = new URLSearchParams(parsedUrl.search).get("socket_id");
      var chunks = [];
      req.on("data", (data) => {
        chunks.push(data);
        if (chunks.length > 1e6) {
          chunks.length = 0;
          res.writeHead(413, { "Content-Type": "text/plain" }).end();
          req.connection.destroy();
        }
      });
      req.on("end", () => {
        const socket = this.sockets[socketId];
        if (!socket) {
          res.writeHead(410).end();
        } else {
          socket.emit("message", Buffer.concat(chunks));
          res.writeHead(200, { "Content-Type": "text/plain" }).end();
        }
      });
    } else {
      res.writeHead(405).end();
    }
  }
}

module.exports = LongPollHandler;
