// Home.tsx

import { useCampaignContext } from "../context/CampaignContext"; // Import the context hook
import DisplayCampaigns from "../components/DisplayCampaign"; // Import the component to display campaigns

const Home = () => {
  const { campaigns, isLoading } = useCampaignContext(); // Access campaigns from context

  return (
    <div>
      <h1>All Campaigns</h1>
      <DisplayCampaigns
        title="All Campaigns"
        isLoading={isLoading}
        campaigns={campaigns}
      />
    </div>
  );
};

export default Home;
