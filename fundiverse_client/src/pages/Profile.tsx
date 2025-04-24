// Profile.tsx
import { useCampaignContext } from "../context/CampaignContext";
import DisplayCampaigns from "../components/DisplayCampaign";
const Profile = () => {
  const { campaigns, isLoading, address } = useCampaignContext(); // Access campaigns and address from context

  // If user is not connected
  if (!address) {
    return <div>Please connect your wallet to view your campaigns.</div>;
  }

  // Filter campaigns by the logged-in user's address
  const userCampaigns = campaigns.filter(
    (c) => c.owner.toLowerCase() === address?.toLowerCase()
  );

  return (
    <div>
      <h1>My Campaigns</h1>
      <DisplayCampaigns
        title="My Campaigns"
        isLoading={isLoading}
        campaigns={userCampaigns}
      />
    </div>
  );
};

export default Profile;
