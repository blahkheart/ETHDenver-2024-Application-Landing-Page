import CryptoJS from "crypto-js";

export const decryptData = (data: string, decrytKey: string) => {
  try {
    const _decryptedData = CryptoJS.AES.decrypt(data, decrytKey);
    const decryptedString = _decryptedData.toString(CryptoJS.enc.Utf8);
    return decryptedString;
  } catch (e) {
    console.log("ERR::decrypt-data", e);
  }
};
