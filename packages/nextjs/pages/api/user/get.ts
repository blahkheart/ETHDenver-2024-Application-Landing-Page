import User, { UserDocument } from "@lib/models/user";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "~~/lib/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse<UserDocument | { message: string }>) {
  const { query } = req;
  const { address } = query;
  await dbConnect();

  if (req.method === "GET") {
    try {
      // Check if user exists in database
      const user = await User.findOne({ address });
      // If user doesn't exist, create a new user in the database
      if (!user) {
        res.status(404).json({ message: "User not found" });
      } else {
        // Return the user document as JSON response
        res.status(200).json(user);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).send({ message: "Method Not Allowed" });
  }
}
