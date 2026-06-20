// Plain, Joi-free session data shared by the client and the server. Keeping it
// separate from server/constants.ts (which pulls in Joi) means the client bundle
// doesn't ship the validation library just to render the score presets.
import type { ScorePreset, Settings } from "./types";

export const scorePresets: ScorePreset[] = [
  {
    type: "fibonacci",
    name: "Fibonacci",
    scores: ["0.5", "1", "2", "3", "5", "8", "13", "21", "100", "Pass"],
  },
  {
    type: "tshirt",
    name: "T-shirt sizes",
    scores: ["XS", "S", "M", "L", "XL", "XXL", "Pass"],
  },
];

// Mirrors the defaults declared on settingsSchema in server/constants.ts.
export const defaultSettings: Settings = {
  scoreSet: scorePresets[0].scores,
  allowParticipantControl: true,
  allowParticipantPagination: false,
  allowParticipantAddDelete: true,
  allowOpenVoting: true,
  showTimer: true,
};
