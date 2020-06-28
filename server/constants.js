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
const Joi = require("@hapi/joi");

const scorePresets = [
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
exports.scorePresets = scorePresets;

const settingsSchema = Joi.object().keys({
  scoreSet: Joi.array().items(Joi.string()).min(2).default(scorePresets[0].scores),
  allowParticipantControl: Joi.boolean().default(true),
  allowOpenVoting: Joi.boolean().default(true),
  showTimer: Joi.boolean().default(true),
  resetTimerOnNewEpoch: Joi.boolean().default(false),
});

exports.defaultSettings = settingsSchema.validate({}).value;
exports.actionSchema = Joi.alternatives()
  .try(
    Joi.object({
      action: Joi.string().valid("nudge", "setHost", "kick").required(),
      clientId: Joi.string().required(),
    }),
    Joi.object({
      action: Joi.string().valid("setDescription").required(),
      description: Joi.string().allow("").required(),
    }),
    Joi.object({
      action: Joi.string().valid("join").required(),
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
      action: Joi.string().valid("reconnect").required(),
      epoch: Joi.number().required(),
      score: Joi.string().allow(null).required(),
      name: Joi.string().allow(null).required(),
      description: Joi.string().allow("").required(),
      settings: settingsSchema.required(),
    }),
    Joi.object({
      action: Joi.string()
        .valid("ping", "leave", "resetBoard", "startTimer", "pauseTimer", "resetTimer")
        .required(),
    })
  )
  .required();

exports.shutdownTimeout = 5000;
exports.heartbeatTimeout = 10000;
// For how long to persist the session data after the last client disconnected.
exports.sessionTtl = 30000;
