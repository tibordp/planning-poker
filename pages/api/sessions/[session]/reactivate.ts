import type { NextApiRequest, NextApiResponse } from "next";
import { state } from "../../../../server/state";
import { reactivateSession } from "../../../../server/session";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ errorCode: "method-not-supported" });
    return;
  }

  const session = state[`${req.query.session}`];
  if (session) {
    reactivateSession(session);
    res.status(200).json({ status: "ok" });
  } else {
    res.status(404).json({ errorCode: "session-not-found" });
  }
}
