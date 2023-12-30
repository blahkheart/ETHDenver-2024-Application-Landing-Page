import Integration, { IntegrationDocument } from "@lib/models/integration";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "~~/lib/dbConnect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IntegrationDocument | { message: string }>,
) {
  const { query } = req;
  const { integrationId } = query;
  await dbConnect();
  if (req.method === "GET") {
    try {
      // Check if integration exists in database
      const integration = await Integration.findOne({ _id: integrationId });
      if (!integration) {
        res.status(404).json({ message: "Integration not found" });
      } else {
        // Return the integration document as JSON response
        res.status(200).json(integration);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).send({ message: "Method Not Allowed" });
  }
}
