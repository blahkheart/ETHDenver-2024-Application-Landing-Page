import dbConnect from "@lib/dbConnect";
import Integration from "@lib/models/integration";
// import User from "@lib/models/user";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // Connect to the database
      await dbConnect();
      const { name, apiKey, siteUrl, secret, apiKeyInternal, description, createdBy } = req.body;

      // Create the new integration
      const newIntegration = new Integration({
        name,
        apiKey,
        siteUrl,
        secret,
        apiKeyInternal,
        description,
        createdBy,
      });

      // Save the new integration to the database
      await newIntegration.save();

      // Add the new integration to the user's list of integrations
      // createdBy.integrations.push(newIntegration._id);
      // await createdBy.save();

      res.status(201).json({ message: "Integration created successfully." });
    } catch (error: any) {
      console.error(error.message);
      res.status(500).json({ message: "Internal server error." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
