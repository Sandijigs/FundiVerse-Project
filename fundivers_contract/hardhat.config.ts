import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";
import "@typechain/hardhat";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
  console.warn(
    "Warning: Missing RPC_URL or PRIVATE_KEY in environment variables"
  );
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/KjJNAozHVVYvbWAIJdwXyV3s87nxsl7W",
      accounts: process.env.PRIVATE_KEY
        ? ["0x64cd4bc583eb8b61522b036693c0567064b4a00c1b69e2a88bdc50f915807"]
        : [],
      chainId: 11155111, // Sepolia's chain ID
    },
  },
  etherscan: {
    apiKey: "JWXETWN6GJYKRS28565T549QFUX44TREM6",
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
};

export default config;
