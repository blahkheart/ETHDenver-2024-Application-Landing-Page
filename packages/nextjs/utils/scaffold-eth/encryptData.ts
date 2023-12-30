import CryptoJS from "crypto-js";

export const encryptData = (data: string, encryptionKey: string): string => {
  const _encryptedData = CryptoJS.AES.encrypt(data, encryptionKey);
  const _encryptedDataString = _encryptedData.toString();
  return _encryptedDataString;
};
