import { ethers } from "ethers";

const getTxReceiptFromHash = async (network: number, txHash: string) => {
  try {
    const unlockProvider = `https://rpc.unlock-protocol.com/${network}`;
    const provider = new ethers.providers.JsonRpcProvider(unlockProvider);
    const txReceipt = await provider.getTransaction(txHash);
    if (!txReceipt || !txReceipt.from) return null;
    return { from: txReceipt.from, receipt: txReceipt };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getTxReceiptFromHash;
