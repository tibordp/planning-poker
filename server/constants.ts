import Joi from "joi";
import { scorePresets, defaultSettings } from "../src/sessionDefaults";

// Re-exported so existing server-side imports (`./constants`) keep working;
// the client imports these directly from src/sessionDefaults to avoid Joi.
export { scorePresets, defaultSettings };

export const settingsSchema = Joi.object().keys({
  scoreSet: Joi.array().items(Joi.string()).min(2).unique().default(scorePresets[0].scores),
  allowParticipantControl: Joi.boolean().default(true),
  allowParticipantPagination: Joi.boolean().default(false),
  allowParticipantAddDelete: Joi.boolean().default(true),
  allowOpenVoting: Joi.boolean().default(true),
  showTimer: Joi.boolean().default(true),
});

export const actionSchema = Joi.alternatives()
  .try(
    Joi.object({
      action: Joi.string().valid("nudge", "setHost", "kick").required(),
      clientId: Joi.string().required(),
    }),
    Joi.object({
      action: Joi.string().valid("newPage").required(),
      navigate: Joi.bool().optional().default(false),
      description: Joi.string().optional(),
    }),
    Joi.object({
      action: Joi.string().valid("navigate", "privateNavigate", "deletePage").required(),
      pageIndex: Joi.number().min(0).required(),
    }),
    Joi.object({
      action: Joi.string().valid("setDescription").required(),
      pageIndex: Joi.number().min(0).required(),
      description: Joi.string().allow("").required(),
    }),
    Joi.object({
      action: Joi.string().valid("join", "kickDisconnected").required(),
      name: Joi.string().required(),
    }),
    Joi.object({
      action: Joi.string().valid("vote").required(),
      score: Joi.string().allow(null).required(),
    }),
    Joi.object({
      action: Joi.string().valid("setVotesVisible").required(),
      votesVisible: Joi.boolean().required(),
    }),
    Joi.object({
      action: Joi.string().valid("setSettings").required(),
      settings: settingsSchema.required(),
    }),
    Joi.object({
      action: Joi.string().valid("importSession").required(),
      sessionData: Joi.object({
        settings: settingsSchema.required(),
        pages: Joi.array()
          .items(
            Joi.object({
              description: Joi.string().allow("").required(),
              // These are not imported, so they can be whatever
              votes: Joi.any(),
              duration: Joi.any(),
            }),
          )
          .min(1)
          .unique()
          .required(),
      }).unknown(true),
    }),
    Joi.object({
      action: Joi.string().valid("reconnect").required(),
      epoch: Joi.number().required(),
      score: Joi.string().allow(null).required(),
      name: Joi.string().allow(null).required(),
    }),
    Joi.object({
      action: Joi.string()
        .valid(
          "ping",
          "leave",
          "resetBoard",
          "startTimer",
          "pauseTimer",
          "resetTimer",
          "finishSession",
        )
        .required(),
    }),
  )
  .required();

export const shutdownTimeout = 5000;
export const heartbeatInterval = Number(process.env.PP_HEARTBEAT_INTERVAL) || 5000;
export const heartbeatTimeout = Number(process.env.PP_HEARTBEAT_TIMEOUT) || 10000;
// For how long to persist the session data after the last client disconnected.
export const sessionTtl = Number(process.env.PP_SESSION_TTL) || 60000;
export const finishedSessionTtl = Number(process.env.PP_FINISHED_SESSION_TTL) || 86400000;
