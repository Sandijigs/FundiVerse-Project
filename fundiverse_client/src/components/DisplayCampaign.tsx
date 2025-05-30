import React from "react";
import { useNavigate } from "react-router-dom";
// import { v4 as uuidv4 } from "uuid";
import FundCard from "./FundCard";
import loader from "../assets/loader.svg";
// Define types for the campaign object
interface Campaign {
  title: string;
  owner: string;
  description: string;
  target: string;
  deadline: number;
  amountCollected: string;
  image: string;
  // Add other campaign properties as needed
}
// Define props interface
interface DisplayCampaignsProps {
  title: string;
  isLoading: boolean;
  campaigns: Campaign[];
}

const DisplayCampaigns: React.FC<DisplayCampaignsProps> = ({
  title,
  isLoading,
  campaigns,
}) => {
  const navigate = useNavigate();

  const handleNavigate = (campaign: Campaign) => {
    navigate(`/campaign-details/${campaign.title}`, { state: campaign });
  };

  return (
    <div>
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">
        {title} ({campaigns.length})
      </h1>

      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {isLoading && (
          <img
            src={loader}
            alt="loader"
            className="w-[100px] h-[100px] object-contain"
          />
        )}

        {!isLoading && campaigns.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            You have not created any campigns yet
          </p>
        )}

        {!isLoading &&
          campaigns.length > 0 &&
          campaigns.map((campaign, index) => (
            <FundCard
              key={index}
              {...{
                ...campaign,
                target: Number(campaign.target),
                amountCollected: Number(campaign.amountCollected),
              }}
              handleClick={() => handleNavigate(campaign)}
            />
          ))}
      </div>
    </div>
  );
};

export default DisplayCampaigns;
