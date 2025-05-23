import dashboard from "../assets/dashboard.svg";
import createCampaign from "../assets/create-campaign.svg";
import payment from "../assets/payment.svg";
import profile from "../assets/profile.svg";
import withdraw from "../assets/withdraw.svg";
import logout from "../assets/logout.svg";

export const navlinks = [
  {
    name: "dashboard",
    imgUrl: dashboard,
    link: "/",
  },
  {
    name: "create-campaign",
    imgUrl: createCampaign,
    link: "/create-campaign",
  },
  {
    name: "payment",
    imgUrl: payment,
    link: "/",
    disabled: true,
  },
  {
    name: "withdraw",
    imgUrl: withdraw,
    link: "/",
    disabled: true,
  },
  {
    name: "profile",
    imgUrl: profile,
    link: "/profile",
  },
  {
    name: "logout",
    imgUrl: logout,
    link: "/",
    disabled: true,
  },
];
