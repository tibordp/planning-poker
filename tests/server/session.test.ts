/**
 * @jest-environment node
 */
import { state } from "../../server/state";
import * as session from "../../server/session";
import { v4 } from "uuid";
import type { ServerSocket } from "../../src/types";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const getSessionName = () => v4();
const fakeSocket = (): ServerSocket => ({
  send: jest.fn(),
  terminate: jest.fn(),
  close: jest.fn(),
  on: jest.fn(),
});

test("client connected", () => {
  const now = new Date("2020-06-23T21:31:09.727Z");
  const sessionName = getSessionName();

  const socket = fakeSocket();
  const sessionState = session.initializeSession(now, sessionName);
  const clientState = session.initializeClient(now, sessionState, socket, "client-id", true);

  expect(state[sessionName]).toBe(sessionState);
  expect(sessionState.clients["client-id"]).toBe(clientState);
  expect(sessionState).toMatchObject({
    clients: {
      "client-id": {
        useHeartbeat: true,
        clientId: "client-id",
        lastHeartbeat: expect.anything(),
        name: null,
        score: null,
        session: state[sessionName],
        socket: socket,
      },
    },
    description: "",
    epoch: 0,
    host: "client-id",
    sessionName: sessionName,
    settings: {
      allowOpenVoting: true,
      allowParticipantControl: true,
      scoreSet: ["0.5", "1", "2", "3", "5", "8", "13", "21", "100", "Pass"],
      showTimer: true,
    },
    timerState: {
      pausedTime: null,
      pausedTotal: 0,
      startTime: now,
    },
    ttlTimer: null,
    votesVisible: false,
  });
});

test("client reconnected", () => {
  const now = new Date("2020-06-23T21:31:09.727Z");
  const sessionName = getSessionName();

  const socket1 = fakeSocket();
  const sessionState1 = session.initializeSession(now, sessionName);
  const clientState1 = session.initializeClient(now, sessionState1, socket1, "client-id", true);

  const socket2 = fakeSocket();
  const sessionState2 = session.initializeSession(now, sessionName);
  const clientState2 = session.initializeClient(now, sessionState2, socket2, "client-id", true);

  expect(sessionState1).toBe(sessionState2);
  expect(clientState1).toBe(clientState2);
  expect(socket1.terminate as jest.Mock).toHaveBeenCalled();
  expect(clientState2.socket).toBe(socket2);
});

test("client disconnected", () => {
  const now = new Date("2020-06-23T21:31:09.727Z");
  const sessionName = getSessionName();

  const socket = fakeSocket();
  const sessionState = session.initializeSession(now, sessionName);
  const clientState = session.initializeClient(now, sessionState, socket, "client-id", true);

  session.cleanupClient(now, clientState);
  expect(sessionState.clients).toStrictEqual({});
  expect(sessionState.ttlTimer).not.toBeNull();

  // Once the (live) session TTL elapses with no clients, the session is finished.
  jest.advanceTimersByTime(60000);
  expect(sessionState.finished).toBe(true);

  // After the finished-session TTL elapses, the session is deleted entirely.
  jest.advanceTimersByTime(86400000);
  expect(state).not.toHaveProperty(sessionName);
});

test("session finished", () => {
  const now = new Date("2020-06-23T21:31:09.727Z");
  const sessionName = getSessionName();

  const socket = fakeSocket();
  const sessionState = session.initializeSession(now, sessionName);
  const clientState = session.initializeClient(now, sessionState, socket, "client-id", true);

  sessionState.finished = true;

  session.cleanupClient(now, clientState);
  expect(sessionState.clients).toStrictEqual({});
  expect(sessionState.ttlTimer).not.toBeNull();

  // A finished session with no clients is deleted after the finished-session TTL.
  jest.advanceTimersByTime(86400000);
  expect(state).not.toHaveProperty(sessionName);
});
