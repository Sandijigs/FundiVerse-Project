import { expect } from "chai";
import { ethers } from "hardhat";
import { FundVerse, FundVerse__factory } from "../typechain";

describe("FundVerse Contract", function () {
  let fundVerse: FundVerse;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    fundVerse = await new FundVerse__factory(deployer).deploy();
    await fundVerse.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy the contract correctly", async function () {
      expect(await fundVerse.getAddress()).to.be.properAddress;
    });
  });

  describe("createCampaign()", function () {
    it("Should emit CampaignCreated on successful campaign creation", async function () {
      const [deployer] = await ethers.getSigners();
      const latestBlock = await ethers.provider.getBlock("latest");
      const deadline = latestBlock!.timestamp + 3600;

      const tx = await fundVerse.createCampaign(
        deployer.address,
        "Campaign 1",
        "Description 1",
        ethers.parseEther("10"),
        BigInt(deadline),
        "imageHash"
      );

      await expect(tx).to.emit(fundVerse, "CampaignCreated");
    });
  });
});

describe("donateToCampaign()", function () {
  let fundVerse: FundVerse;
  let campaignId: bigint;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    fundVerse = await new FundVerse__factory(deployer).deploy();
    await fundVerse.waitForDeployment();

    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = latestBlock!.timestamp + 3600;

    const tx = await fundVerse.createCampaign(
      deployer.address,
      "Campaign 1",
      "Description 1",
      ethers.parseEther("10"),
      BigInt(deadline),
      "imageHash"
    );

    const receipt = await tx.wait();

    if (receipt?.logs?.length === 0) {
      throw new Error("No logs emitted by the contract");
    }

    const event = receipt?.logs[0]; // first log should be CampaignCreated
    if (!event) {
      throw new Error("Event not found in logs");
    }

    const decoded = fundVerse.interface.decodeEventLog(
      "CampaignCreated",
      event.data,
      event.topics
    );

    campaignId = decoded.id;
  });

  it("Should allow donations, emit DonationReceived event, and update amount collected", async function () {
    const [, donor] = await ethers.getSigners();
    const donationAmount = ethers.parseEther("1");

    // First, donate to the campaign and check for the DonationReceived event
    const tx = await fundVerse
      .connect(donor)
      .donateToCampaign(campaignId, { value: donationAmount });

    // Ensure the DonationReceived event was emitted
    await expect(tx).to.emit(fundVerse, "DonationReceived");

    // Fetch the updated campaign data
    const campaign = await fundVerse.campaigns(campaignId);

    // Ensure the amount collected is updated correctly
    expect(campaign.amountCollected).to.equal(donationAmount);
  });
  it("Should revert when campaign does not exist", async function () {
    const [, donor] = await ethers.getSigners();
    const donationAmount = ethers.parseEther("1");

    await expect(
      fundVerse.connect(donor).donateToCampaign(9999, { value: donationAmount }) // Invalid campaign ID
    ).to.be.revertedWith("Campaign does not exist");
  });
  it("Should revert when donation amount is zero", async function () {
    const [, donor] = await ethers.getSigners();
    await expect(
      fundVerse.connect(donor).donateToCampaign(campaignId, { value: 0 }) // Zero donation
    ).to.be.revertedWith("Donation must be greater than 0");
  });
  it("Should update amount collected correctly after multiple donations", async function () {
    const [, donor1, donor2] = await ethers.getSigners();
    const donationAmount1 = ethers.parseEther("1");
    const donationAmount2 = ethers.parseEther("2");

    // First donation
    await fundVerse
      .connect(donor1)
      .donateToCampaign(campaignId, { value: donationAmount1 });
    let campaign = await fundVerse.campaigns(campaignId);
    expect(campaign.amountCollected).to.equal(donationAmount1);

    // Second donation
    await fundVerse
      .connect(donor2)
      .donateToCampaign(campaignId, { value: donationAmount2 });
    campaign = await fundVerse.campaigns(campaignId);
    expect(campaign.amountCollected).to.equal(
      donationAmount1 + donationAmount2
    );
  });
});

describe("FundVerse - createCampaign()", function () {
  let fundVerse: FundVerse;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    const factory = new FundVerse__factory(deployer);
    fundVerse = await factory.deploy();
    await fundVerse.waitForDeployment();
  });

  it("Should revert when owner address is zero", async function () {
    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = latestBlock!.timestamp + 3600;

    await expect(
      fundVerse.createCampaign(
        ethers.ZeroAddress,
        "Campaign 1",
        "Description 1",
        ethers.parseEther("10"),
        deadline,
        "imageHash"
      )
    ).to.be.revertedWith("Owner cannot be zero address");
  });

  it("Should revert when title is empty", async function () {
    const [deployer] = await ethers.getSigners();
    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = latestBlock!.timestamp + 3600;

    await expect(
      fundVerse.createCampaign(
        deployer.address,
        "",
        "Description 1",
        ethers.parseEther("10"),
        deadline,
        "imageHash"
      )
    ).to.be.revertedWith("Title cannot be empty");
  });
  it("Should revert when image is empty", async function () {
    const [deployer] = await ethers.getSigners();
    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = latestBlock!.timestamp + 3600;

    await expect(
      fundVerse.createCampaign(
        deployer.address,
        "Campaign 1",
        "Description 1",
        ethers.parseEther("10"),
        deadline,
        ""
      )
    ).to.be.revertedWith("Image cannot be empty");
  });
  it("Should revert when deadline is in the past", async function () {
    const [deployer] = await ethers.getSigners();
    const latestBlock = await ethers.provider.getBlock("latest");
    const pastDeadline = latestBlock!.timestamp - 3600; // 1 hour ago

    await expect(
      fundVerse.createCampaign(
        deployer.address,
        "Campaign 1",
        "Description 1",
        ethers.parseEther("10"),
        pastDeadline,
        "imageHash"
      )
    ).to.be.revertedWith("Deadline must be in the future");
  });
  it("Should revert when target is zero", async function () {
    const [deployer] = await ethers.getSigners();
    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = latestBlock!.timestamp + 3600;

    await expect(
      fundVerse.createCampaign(
        deployer.address,
        "Campaign 1",
        "Description 1",
        0, // zero target
        deadline,
        "imageHash"
      )
    ).to.be.revertedWith("Target must be more than zero");
  });
});

describe("FundVerse Contract", function () {
  let fundVerse: FundVerse;
  let campaignId: bigint;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    fundVerse = await new FundVerse__factory(deployer).deploy();
    await fundVerse.waitForDeployment();

    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = latestBlock!.timestamp + 3600;

    // Create a campaign before each test
    const tx = await fundVerse.createCampaign(
      deployer.address,
      "Campaign 1",
      "Description 1",
      ethers.parseEther("10"),
      BigInt(deadline),
      "imageHash"
    );

    const receipt = await tx.wait();
    const event = receipt?.logs[0]; // First log should be CampaignCreated

    // Ensure that the event is defined before decoding
    if (!event) {
      throw new Error("Event not found");
    }

    const decoded = fundVerse.interface.decodeEventLog(
      "CampaignCreated",
      event.data,
      event.topics
    );

    campaignId = decoded.id;
  });

  describe("getDonators()", function () {
    it("Should return empty lists when no donations have been made", async function () {
      // Fetch the donators and donations for the campaign
      const [donators, donations] = await fundVerse.getDonators(campaignId);

      // Ensure both lists are empty
      expect(donators.length).to.equal(0);
      expect(donations.length).to.equal(0);
    });

    it("Should return correct donators and donations after donation", async function () {
      const [, donor] = await ethers.getSigners();
      const donationAmount = ethers.parseEther("1");

      // Donor makes a donation to the campaign
      await fundVerse
        .connect(donor)
        .donateToCampaign(campaignId, { value: donationAmount });

      // Fetch the donators and donations for the campaign
      const [donators, donations] = await fundVerse.getDonators(campaignId);

      // Ensure the donator and donation are correctly recorded
      expect(donators).to.include(donor.address);
      expect(donations).to.include(donationAmount);

      // Ensure the donator is the first one in the list
      expect(donators[0]).to.equal(donor.address);
      expect(donations[0]).to.equal(donationAmount);
    });

    it("Should return multiple donators and their respective donations", async function () {
      const [, donor1, donor2] = await ethers.getSigners();
      const donationAmount1 = ethers.parseEther("1");
      const donationAmount2 = ethers.parseEther("2");

      // Two donors make donations to the campaign
      await fundVerse
        .connect(donor1)
        .donateToCampaign(campaignId, { value: donationAmount1 });
      await fundVerse
        .connect(donor2)
        .donateToCampaign(campaignId, { value: donationAmount2 });

      // Fetch the donators and donations for the campaign
      const [donators, donations] = await fundVerse.getDonators(campaignId);

      // Ensure both donors and their respective donations are recorded
      expect(donators).to.include(donor1.address);
      expect(donators).to.include(donor2.address);
      expect(donations).to.include(donationAmount1);
      expect(donations).to.include(donationAmount2);

      // Ensure the donators and donations are in the correct order
      expect(donators[0]).to.equal(donor1.address);
      expect(donations[0]).to.equal(donationAmount1);

      expect(donators[1]).to.equal(donor2.address);
      expect(donations[1]).to.equal(donationAmount2);
    });
  });
});
