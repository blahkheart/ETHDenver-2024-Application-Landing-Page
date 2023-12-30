import { withNextCors } from "../middleware/cors";
import Tier, { TierDocument } from "@lib/models/tier";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "~~/lib/dbConnect";


export default withNextCors(async (req: NextApiRequest, res: NextApiResponse<TierDocument | { message: string }>) => {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed." });
    return;
  }
  try {
    const { query } = req;
    const { tierId } = query;
    await dbConnect();

    const tier = await Tier.findOne({ id: tierId });
    if (!tier) {
      res.status(404).json({ message: "Tier not found" });
    } else {
      // Return the tier document as JSON response
      res.status(200).json(tier);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});