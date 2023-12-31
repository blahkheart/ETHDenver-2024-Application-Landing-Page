import type { NextApiRequest, NextApiResponse } from "next";
import AES from "~~/utils/aes";

const _16_BYTES_IV = process.env.ENCRYPTOR_IV;
const _32_BYTES_KEY = process.env.ENCRYPTOR_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }
  if (!_32_BYTES_KEY || !_16_BYTES_IV) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  const { input } = req.body;
  // initialize encriptor
  const _encryptor = new AES(_32_BYTES_KEY, _16_BYTES_IV);

  if (input) {
    const encrypted = _encryptor.encrypt(JSON.stringify(input));
    return res.status(200).json({ encrypted });
  } else {
    console.log("API POST /api/apply");
    return res.status(200).json({});
  }
}
