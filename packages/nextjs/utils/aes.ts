import crypto from "crypto";

export default class AES {
  constructor(private key: string, private iv: string) {}

  encrypt(text: string) {
    const cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.iv);
    const crypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return crypted.toString("base64url");
  }

  decrypt(text: string) {
    const input = Buffer.from(text, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", this.key, this.iv);
    const decrypted = Buffer.concat([decipher.update(input), decipher.final()]);
    return decrypted.toString("utf8");
  }
}
