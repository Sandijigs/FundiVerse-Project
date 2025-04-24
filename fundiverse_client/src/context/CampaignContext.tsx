import { createContext, useContext, useEffect, useState } from "react";
import { getCampaigns } from "../utils/contractFunctions";
import { useAccount } from "wagmi";

type Campaign = {
  id: string;
  title: string;
  description: string;
  owner: string;
  target: string;
  deadline: number;
  amountCollected: string;
  image: string;
};

interface CampaignContextProps {
  campaigns: Campaign[];
  isLoading: boolean;
  fetchCampaigns: () => void;
  address: string | null; // Add address to the context
}

const CampaignContext = createContext<CampaignContextProps | null>(null);

export const CampaignProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount(); // Get the address from wagmi

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns(import.meta.env.VITE_CONTRACT_ADDRESS);
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        isLoading,
        fetchCampaigns,
        address: address || null,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (!context)
    throw new Error(
      "useCampaignContext must be used within a CampaignProvider"
    );
  return context;
};
