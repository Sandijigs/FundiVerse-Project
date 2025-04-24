import { ethers } from "ethers";
import { EIP1193Provider, WalletClient } from "viem"; // from viem, not wagmi
import { getContract } from "./contract";

type CampaignData = {
  name: string;
  title: string;
  description: string;
  target: bigint; // in ETH (e.g. "0.5")
  deadline: number; // ISO string or something parseable by `new Date(...)`
  image: string;
};

export const createNewCampaign = async (
  walletClient: WalletClient | undefined,
  address: string | undefined,
  data: CampaignData
): Promise<string | undefined> => {
  try {
    if (!walletClient || !address) {
      console.error("Wallet not connected");
      return;
    }
    console.log(walletClient);
    console.log(address);
    console.log(data);

    // Convert WalletClient (viem) to Ethers signer
    // const provider = new ethers.BrowserProvider(walletClient.transport as any);

    const provider = new ethers.BrowserProvider(
      walletClient.transport as unknown as EIP1193Provider
    );
    const signer = await provider.getSigner();

    const contract = getContract(signer);

    const targetWei = data.target;
    // returns a bigint

    const deadlineTimestamp = Math.floor(
      new Date(data.deadline).getTime() / 1000
    );

    const tx = await contract.createCampaign(
      address,
      data.title,
      data.description,
      targetWei,
      deadlineTimestamp,
      data.image
    );

    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error creating campaign:", error);
    return;
  }
};
