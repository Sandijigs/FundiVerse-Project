/* eslint-disable @typescript-eslint/no-explicit-any */
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

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// Create New Campaign
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

    const provider = new ethers.BrowserProvider(
      walletClient.transport as unknown as EIP1193Provider
    );
    const signer = await provider.getSigner();
    const contract = getContract(signer, contractAddress);

    const targetWei = data.target;
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

export const getCampaigns = async (contractAddress: string): Promise<any[]> => {
  const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${
      import.meta.env.VITE_ALCHEMY_API_KEY
    }`
  );
  const contract = getContract(provider, contractAddress);

  try {
    const campaigns = await contract.getCampaigns();

    const parsedCampaigns = campaigns.map((campaign: any, i: number) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.formatEther(campaign.target),
      deadline: Number(campaign.deadline),
      amountCollected: ethers.formatEther(campaign.amountCollected),
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaigns;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
};

export const donateToCampaign = async (
  walletClient: WalletClient | undefined,
  address: string | undefined,
  pId: number,
  amount: string
): Promise<string | undefined> => {
  try {
    if (!walletClient || !address) {
      console.error("Wallet not connected");
      return;
    }

    const provider = new ethers.BrowserProvider(
      walletClient.transport as unknown as EIP1193Provider
    );
    const signer = await provider.getSigner();

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const contract = getContract(signer, contractAddress);

    const amountInWei = ethers.parseEther(amount);

    const tx = await contract.donateToCampaign(pId, {
      value: amountInWei,
    });

    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error donating to campaign:", error);
    return;
  }
};

export const getDonors = async (campaignId: number) => {
  const provider = new ethers.JsonRpcProvider(
    `https://eth-sepolia.g.alchemy.com/v2/${
      import.meta.env.VITE_ALCHEMY_API_KEY
    }`
  );
  const contract = getContract(provider, contractAddress);

  try {
    // Call the getDonators method to fetch donators and their donations for a specific campaign
    const [donators, donations] = await contract.getDonators(campaignId);

    // Process and return the result
    const parsedDonors = donators.map((donator: string, i: number) => ({
      donator,
      donationAmount: ethers.formatEther(donations[i]),
    }));

    return parsedDonors;
  } catch (error) {
    console.error("Error fetching donors:", error);
    return [];
  }
};
