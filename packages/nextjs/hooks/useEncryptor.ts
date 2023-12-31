import AES from "~~/utils/aes";

const _16_BYTES_IV = process.env.ENCRYPTOR_IV;
const _32_BYTES_KEY = process.env.ENCRYPTOR_KEY;
console.log("BOoK", _32_BYTES_KEY);

export const useEncryptor = () => {
  if (!_32_BYTES_KEY || !_16_BYTES_IV) return {};

  const _encryptor = new AES(_32_BYTES_KEY, _16_BYTES_IV);
  console.log("HOOK");
  return _encryptor;
};
