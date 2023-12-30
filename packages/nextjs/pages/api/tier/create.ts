import dbConnect from "@lib/dbConnect";
import Tier from "@lib/models/tier";
import axios from "axios";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import Integration from "~~/lib/models/integration";
import authOptions from "~~/pages/api/auth/auth-options";
import { decryptData } from "~~/utils/scaffold-eth";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  try {
    // Connect to the database
    await dbConnect();
    // get data from request
    const {
      name,
      monthlyLockAddress,
      yearlyLockAddress,
      network,
      description,
      type,
      visibility,
      yearlyPrice,
      monthlyPrice,
      welcomePageUrl,
      currency,
      createdBy,
      integrationId,
      message,
      signature,
    } = req.body;
    // get session
    const session: any = await getServerSession(req, res, authOptions);

    // verify user
    const integration = await Integration.findOne({ _id: integrationId });
    const { createdBy: integrationCreator, siteUrl: ghostBlogBaseUrl, apiKey: encryptedApiKey } = integration;
    const userAddress = session?.user.name; //user from session
    const decodedAddress = ethers.utils.verifyMessage(message, signature);
    if (userAddress !== decodedAddress || createdBy !== integrationCreator.toString()) {
      return res.status(401).json({ message: "User Authorization Failed" });
    }

    // decryt API key
    const decryptedApiKey = decryptData(encryptedApiKey, signature);
    if (!decryptedApiKey) {
      return res.status(400).json({ message: "Error decrypting API key" });
    }

    const [id, secret] = decryptedApiKey.split(":");
    if (!id || !secret) {
      return res.status(400).json({ message: "Invalid API key" });
    }

    const newTier = new Tier({
      id: "0x0",
      name,
      monthlyLockAddress,
      yearlyLockAddress,
      network,
      description,
      type,
      visibility,
      yearlyPrice,
      monthlyPrice,
      welcomePageUrl,
      currency,
      createdBy,
      integrationId,
    });
    // Save new tier to database
    await newTier.save();

    // generate token
    const token = jwt.sign({}, Buffer.from(secret, "hex"), {
      keyid: id,
      algorithm: "HS256",
      expiresIn: "5m",
      audience: `/admin/`,
    });

    // Create new tier on Ghost
    const ghostApiUrl = `${ghostBlogBaseUrl}/ghost/api/admin/tiers/`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Ghost ${token}`,
      "Accept-Version": "v5.24",
    };
    const payload = {
      tiers: [
        {
          name,
          description,
          visibility,
          monthly_price: monthlyPrice,
          yearly_price: yearlyPrice,
          currency,
          welcome_page_url: welcomePageUrl,
        },
      ],
    };

    const response = await axios.post(ghostApiUrl, payload, { headers });
    if (response.status === 201) {
      const tierId = response.data.tiers[0].id;
      // Update the `id` field
      await Tier.updateOne({ _id: newTier._id }, { id: tierId });
      return res.status(201).json({ message: "Tier created successfully.", data: newTier });
    } else {
      // Delete the previously created entry in your API database
      await newTier.remove();
      return res.status(400).send({
        title: "Bad request",
        msg: "Error creating tier",
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}