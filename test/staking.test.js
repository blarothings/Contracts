const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BLRStaking", function () {
  let BLR, blrToken, staking, owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // Deploy BLR token
    BLR = await ethers.getContractFactory("Blarothings");
    blrToken = await BLR.deploy(owner.address);
    await blrToken.deployed();

    // Transfer tokens to user1
    await blrToken.transfer(user1.address, ethers.utils.parseEther("1000"));

    // Deploy staking contract
    const Staking = await ethers.getContractFactory("BLRStaking");
    staking = await Staking.deploy(blrToken.address);
    await staking.deployed();
  });

  it("should allow user to stake tokens", async function () {
    const amount = ethers.utils.parseEther("100");

    await blrToken.connect(user1).approve(staking.address, amount);
    await staking.connect(user1).stake(amount, 30 * 24 * 60 * 60, false); // 30 days pool, unlocked

    expect(await staking.balanceOf(user1.address)).to.equal(amount);
    expect(await blrToken.balanceOf(staking.address)).to.equal(amount);
  });

  it("should calculate and allow reward claiming after some time", async function () {
    const amount = ethers.utils.parseEther("100");
    await blrToken.connect(user1).approve(staking.address, amount);
    await staking.connect(user1).stake(amount, 30 * 24 * 60 * 60, false);

    const ids = await staking.investorOrderIds(user1.address);

    await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const reward = await staking.pendingRewards(ids[0]);
    expect(reward).to.be.gt(0);

    await staking.connect(user1).claim(ids[0]);
  });

  it("should allow user to unstake and get rewards", async function () {
    const amount = ethers.utils.parseEther("100");
    await blrToken.connect(user1).approve(staking.address, amount);
    await staking.connect(user1).stake(amount, 30 * 24 * 60 * 60, false);

    const ids = await staking.investorOrderIds(user1.address);

    await ethers.provider.send("evm_increaseTime", [35 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await staking.connect(user1).unstake(ids[0]);
    expect(await blrToken.balanceOf(user1.address)).to.be.closeTo(ethers.utils.parseEther("1000"), ethers.utils.parseEther("1"));
  });
});
