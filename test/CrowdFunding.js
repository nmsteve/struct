// Import necessary modules
const { ethers } = require('hardhat');
const { expect } = require('chai');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('CrowdFunding Contract', function () {
  
  async function deploy() {
   const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    CrowdFunding = await ethers.getContractFactory('CrowdFunding');
    crowdFunding = await CrowdFunding.deploy();
    return { crowdFunding, owner, addr1, addr2, addrs }
    
  }

  // Deploy the contract for each test
  beforeEach(async function () {
    ( { crowdFunding, owner, addr1,addr2,addrs} = await loadFixture(deploy))
  });

  it('Should deploy the contract and check campaign creation', async function () {
    // Create a new campaign
    const beneficiary = addr1.address;
    const goal = ethers.parseEther('1'); // 1 ether
    await crowdFunding.newCampaign(beneficiary, goal);

    // Check the created campaign
    const campaign = await crowdFunding.campaigns(0);

    expect(campaign.beneficiary).to.equal(beneficiary);
    expect(campaign.fundingGoal).to.equal(goal);
    expect(campaign.numFunders).to.equal(0);
    expect(campaign.amount).to.equal(0);
  });

  it('Should allow contributions to the campaign', async function () {
    // Create a new campaign
    const beneficiary = addr1.address;
    const goal = ethers.parseEther('1'); // 1 ether
    await crowdFunding.newCampaign(beneficiary, goal);

    // Contribute to the campaign
    const value = ethers.parseEther('0.5'); // 0.5 ether
    await crowdFunding.connect(addr1).contribute(0, { value });

    // Check the contributed amount
    const campaign = await crowdFunding.campaigns(0);
    console.log(campaign.funders)
    expect(campaign.amount).to.equal(value);
  });

  it.skip('Should check if the goal is reached and transfer funds', async function () {
    // Create a new campaign
    const beneficiary = addr1.address;
    const goal = ethers.parseEther('1'); // 1 ether
    await crowdFunding.newCampaign(beneficiary, goal);

    // Contribute to the campaign
    const value = ethers.parseEther('1.5'); // 1.5 ether
    await crowdFunding.connect(addr1).contribute(0, { value });

    // Check if the goal is reached
    const goalReached = await crowdFunding.checkGoalReached(0);
    await goalReached.wait(1)
    console.log(goalReached)
    expect(goalReached).to.be.true;
  });

  it('Should return information for multiple funders of a campaign', async function () {
    // Create a new campaign
    const beneficiary = addr1.address;
    const goal = ethers.parseEther('1'); // 1 ether
    await crowdFunding.newCampaign(beneficiary, goal);

    // Contribute to the campaign multiple times
    const values = [
      ethers.parseEther('0.5'), // 0.5 ether
      ethers.parseEther('0.3'), // 0.3 ether
      ethers.parseEther('0.2'), // 0.2 ether
      ethers.parseEther('0.4'), // 0.4 ether
      ethers.parseEther('0.1')  // 0.1 ether
    ];

    for (let i = 0; i < values.length; i++) {
      await crowdFunding.connect(addr1).contribute(0, { value: values[i] });
    }

    // Get information for all funders
    const numFundRequests = 5; // Assuming there are 5 funders
    const fundersInfo = [];
    for (let i = 0; i < numFundRequests; i++) {
      const funder = await crowdFunding.getFunders(0, i);
      fundersInfo.push(funder);
    }

    // Print the information in a table
    console.log('Funders Information:');
    console.log('-------------------------------------------------------------');
    console.log('|    Funder Address                          | Contribution |');
    console.log('-------------------------------------------------------------');
    fundersInfo.forEach((funder, index) => {
      console.log(`| ${funder.addr} | ${ethers.formatEther(funder.amount)} ETH      |`);
    });
    console.log('-------------------------------------------------------------');

    // Assertions 
    expect(fundersInfo[0].addr).to.equal(addr1.address);
    expect(fundersInfo[0].amount).to.equal(values[0]);
  });

});
