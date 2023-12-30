import { withNextCors } from "../middleware/cors";
import dbConnect from "@lib/dbConnect";
import axios from "axios";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { abi as publicLockABI } from "~~/abi/publicLock";
import Integration from "~~/lib/models/integration";
import Subscriber from "~~/lib/models/subscriber";
import Tier from "~~/lib/models/tier";
import { decryptData } from "~~/utils/scaffold-eth";
import { addTier } from "~~/utils/scaffold-eth/addTier";
import getTxReceiptFromHash from "~~/utils/scaffold-eth/getTxReceiptFromHash";

const envSecret = process.env.SECRET;

export default withNextCors(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  try {
    // Connect to the database
    await dbConnect();
    // Get data from request
    const { hash, email, lockAddress } = req.body;
    const dbQuery = { $or: [{ monthlyLockAddress: lockAddress }, { yearlyLockAddress: lockAddress }] };

    // Find the tier for this lockAddress
    const { id, name, network, integrationId } = await Tier.findOne(dbQuery);

    // Get transaction receipt from transaction hash
    const txReceipt = await getTxReceiptFromHash(network, hash);
    if (!txReceipt) return res.status(400).json({ message: "Invalid transaction hash" });
    const { from: subscriberAddress } = txReceipt;

    // Get the integration for this tier
    const { apiKeyInternal, secret, siteUrl } = await Integration.findOne({ _id: integrationId });
    const tierId = id;

    // Decrypt API key
    const decryptKey = `${secret}:${envSecret}`;
    const decryptedApiKey = decryptData(apiKeyInternal, decryptKey);
    if (!decryptedApiKey) {
      return res
        .status(400)
        .json({ message: "Error decrypting API key", secret, envSecret, apiKeyInternal, decryptKey });
    }

    const unlockProvider = `https://rpc.unlock-protocol.com/${network}`;
    const provider = new ethers.providers.JsonRpcProvider(unlockProvider);
    const publicLockContract = new ethers.Contract(lockAddress, publicLockABI, provider);

    // Check if address has a valid key to the lockAddress
    const hasValidKey = await publicLockContract.getHasValidKey(subscriberAddress);
    if (!hasValidKey) {
      return res.status(401).json({ message: `User has no valid key for tier with address: ${lockAddress}` });
    }

    // Get key expiration timestamp from lock
    const tokenId = await publicLockContract.tokenOfOwnerByIndex(subscriberAddress, 0);
    const keyExpiryTimestamp = await publicLockContract.keyExpirationTimestampFor(tokenId);
    const keyExpiryTimestampInSeconds = keyExpiryTimestamp * 1000; // Convert to seconds

    const [apiKeyId, apiKeySecret] = decryptedApiKey.split(":");
    if (!apiKeyId || !apiKeySecret) {
      return res.status(400).json({ message: "Invalid API key" });
    }

    let subscriber = await Subscriber.findOne({ $and: [{ email }, { address: subscriberAddress }] });
    if (!subscriber) {
      subscriber = await new Subscriber({
        id: "0x0",
        tiers: [{ tier: tierId, isActive: false }],
        address: subscriberAddress,
        email,
        startDate: Date.now(),
        endDate: keyExpiryTimestampInSeconds,
      });
      await subscriber.save();
    }
    const existingTier = subscriber.tiers.find((tier: any) => tier.tier.toString() === tierId);
    if (subscriber && existingTier?.isActive) return res.status(200).json({ message: "Already subscribed" });

    // Generate Ghost admin API token
    const token = jwt.sign({}, Buffer.from(apiKeySecret, "hex"), {
      keyid: apiKeyId,
      algorithm: "HS256",
      expiresIn: "5m",
      audience: `/admin/`,
    });

    // Ghost API endpoint URL
    const ghostApiUrl = `${siteUrl}/ghost/api/admin/members/`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Ghost ${token}`,
      "Accept-Version": "v5.24",
    };

    // Get all members from Ghost admin
    const { members } = await axios.get(ghostApiUrl, { headers }).then(response => response.data);
    if (!members) return res.status(400).json({ message: "Error fetching from Ghost admin" });

    // Find user with 'email' address
    const member = members.find((user: any) => user.email === email);
    if (!member) return res.status(400).json({ message: "User not found in Ghost admin" });
    /*************************************************************************************
     * Get member tiers
     * allows us append new subscriptions to a member's tiers array
     * rather than replacing previous subscriptions whenever they subscribe to a new tier
     *
     ************************************************************************************/
    const memberTiers = member.subscriptions.map((subscription: any) => {
      const _tier = {
        id: subscription.tier.id,
        name: subscription.tier.name,
        expiry_at: subscription.tier.expiry_at,
      };
      return _tier;
    });

    const ghostAdminResponse = await addTier(
      memberTiers,
      headers,
      siteUrl,
      member.id,
      name,
      tierId,
      keyExpiryTimestampInSeconds,
    );
    // Update subscriber on unlock-ghost api
    if (ghostAdminResponse?.status === 200) {
      existingTier ? (existingTier.isActive = true) : subscriber.tiers.push({ tier: tierId, isActive: true });
      subscriber.id = member.id;

      await subscriber.save();
      return res.status(201).json({ message: "Member subscribed successfully.", data: subscriber });
    } else {
      return res.status(500).json({ message: "Error subscribing user" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});
