import User, { UserDocument } from "@lib/models/user";
import type { NextApiRequest, NextApiResponse } from "next";

interface UserData {
  address: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<UserDocument | string>) {
  if (req.method === "POST") {
    try {
      const { address }: UserData = req.body;
      // Check if user exists in database
      const user = await User.findOne({ address });
      // If user doesn't exist end with 404
      if (!user) {
        return res.status(404).end();
      } else {
        // Return the user document as JSON response
        return res.status(200).json(user);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  } else {
    return res.status(405).send("Method Not Allowed");
  }
}
