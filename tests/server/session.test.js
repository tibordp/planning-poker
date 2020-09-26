import { state } from "../../server/state";
import * as session from "../../server/session";
import { v4 } from "uuid";

beforeEach(() => {
  jest.useFakeTimers();
});

const getSessionName = () => v4();
const fakeSocket = () => ({ send: jest.fn(), terminate: jest.fn() });

test("client connected", () => {
  const now = new Date("2020-06-23T21:31:09.727Z");
  const sessionName = getSessionName();

  const socket = fakeSocket();
  const sessionState = session.initializeSession(now, sessionName, "client-id");
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
  const sessionState1 = session.initializeSession(now, sessionName, "client-id");
  const clientState1 = session.initializeClient(now, sessionState1, socket1, "client-id", true);

  const socket2 = fakeSocket();
  const sessionState2 = session.initializeSession(now, sessionName, "client-id");
  const clientState2 = session.initializeClient(now, sessionState2, socket2, "client-id", true);

  expect(sessionState1).toBe(sessionState2);
  expect(clientState1).toBe(clientState2);
  expect(socket1.terminate).toBeCalled();
  expect(clientState2.socket).toBe(socket2);
});

test("client disconnected", () => {
  const now = new Date("2020-06-23T21:31:09.727Z");
  const sessionName = getSessionName();

  const socket = fakeSocket();
  const sessionState = session.initializeSession(now, sessionName, "client-id");
  const clientState = session.initializeClient(now, sessionState, socket, "client-id", true);

  jest.useFakeTimers(); // Clean any timers from before

  session.cleanupClient(now, clientState);
  expect(sessionState.clients).toStrictEqual({});
  expect(sessionState.ttlTimer).not.toBeNull();

  expect(setTimeout).toHaveBeenCalledTimes(1);
  const [callback, interval, ...args] = setTimeout.mock.calls[0];
  expect(interval).toBe(60000);

  callback(...args);
  expect(state).not.toHaveProperty(sessionName);
});
