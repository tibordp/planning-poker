const host = { clientId: "5cdf4eb9-4c88-47ee-85da-5a2e970ed79f", score: "5", name: "Host" };
const voter1 = { clientId: "e72112df-0dc2-46bb-9e04-1deb51192d21", score: "5", name: "Voter 1" };
const voter2 = { clientId: "d3cdcb5f-6c20-43fc-9841-ef32e57ca5fb", score: null, name: "Voter 2" };
const observer = { clientId: "bae11af7-7cd5-44de-bbbe-5c6f224c1b90", score: null, name: null };

const clients = [host, voter1, voter2, observer];

const defaultSettings = {
  scoreSet: ["0.5", "1", "2", "3", "5", "8", "13", "21", "100", "Pass"],
  allowParticipantControl: true,
  allowOpenVoting: true,
  showTimer: true,
  resetTimerOnNewEpoch: false,
};

const noControlSettings = {
  ...defaultSettings,
  allowParticipantControl: false,
};

const defaultState = {
  epoch: 0,
  host: "5cdf4eb9-4c88-47ee-85da-5a2e970ed79f",
  settings: defaultSettings,
  startedOn: "2020-06-23T21:31:09.727Z",
  description: "### Markdown",
  timerState: { startTime: "2020-06-23T21:31:09.727Z", pausedTime: null, pausedTotal: 0 },
  votesVisible: false,
  clients,
  me: host,
};

export const remoteStateAsHost = {
  ...defaultState,
};

export const remoteStateAsObserver = {
  ...defaultState,
  me: observer,
};

export const remoteStateAsVoter = {
  ...defaultState,
  me: voter1,
};

export const remoteStateAsVoterNoControl = {
  ...defaultState,
  settings: noControlSettings,
  me: voter1,
};

export const remoteStateVotesVisible = {
  ...defaultState,
  votesVisible: true,
};

export const remoteStateNoTimer = {
  ...defaultState,
  settings: {
    ...defaultSettings,
    showTimer: false,
  },
};
