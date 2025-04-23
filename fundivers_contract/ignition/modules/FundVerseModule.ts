import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FundVerseModule = buildModule("FundVerseModule", (m) => {
  const fundVerse = m.contract("FundVerse");

  return { fundVerse };
});

export default FundVerseModule;
