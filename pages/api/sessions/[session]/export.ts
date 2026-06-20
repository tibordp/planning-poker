import type { NextApiRequest, NextApiResponse } from "next";
import { state } from "../../../../server/state";
import { exportSession } from "../../../../server/serialization";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ errorCode: "method-not-supported" });
    return;
  }

  const session = state[`${req.query.session}`];
  if (session) {
    res.setHeader("Content-Disposition", `attachment; filename=${session.sessionName}.json`);
    res.status(200).json(exportSession(session));
  } else {
    res.status(404).json({ errorCode: "session-not-found" });
  }
}
