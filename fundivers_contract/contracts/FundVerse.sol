// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract FundVerse is ReentrancyGuard {
    struct Campaign {
        address payable owner; // 20 bytes
    uint256 target;        // 32 bytes
    uint256 deadline;      // 32 bytes 
    uint256 amountCollected; // 32 bytes
    string title;          // (dynamic)
    string description;    // (dynamic)
    string image;         // (dynamic)
    address[] donators;    // (dynamic)
    uint256[] donations;   // (dynamic)
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns;

    /// EVENTS ///
    event CampaignCreated(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 target,
        uint256 deadline
    );

    event DonationReceived(
        uint256 indexed id,
        address indexed donator,
        uint256 amount
    );

    function createCampaign(
        address payable _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_owner != address(0), "Owner cannot be zero address");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_image).length > 0, "Image cannot be empty");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_target > 0, "Target must be more than zero");

        Campaign storage campaign = campaigns[numberOfCampaigns];

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.image = _image;

        emit CampaignCreated(
            numberOfCampaigns,
            _owner,
            _title,
            _target,
            _deadline
        );

        unchecked {
            numberOfCampaigns++;
        }

        return numberOfCampaigns - 1;
    }

   function donateToCampaign(uint256 _id) external payable nonReentrant {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        require(msg.value > 0, "Donation must be greater than 0");

        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);

        (bool sent, ) = campaign.owner.call{value: msg.value}("");
        require(sent, "Transfer to owner failed");

        campaign.amountCollected += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
    }

    function getDonators(uint256 _id)
        external
        view
        returns (address[] memory, uint256[] memory)
    {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_id];
        return (campaign.donators, campaign.donations);
    }

    function getCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory all = new Campaign[](numberOfCampaigns);

        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            all[i] = campaigns[i];
        }

        return all;
    }
}

