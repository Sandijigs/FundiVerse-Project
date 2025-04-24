import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Providers } from "./Provider";
import { BrowserRouter } from "react-router-dom";
import { CampaignProvider } from "./context/CampaignContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <CampaignProvider>
          <App />
        </CampaignProvider>
      </Providers>
    </BrowserRouter>
  </React.StrictMode>
);
