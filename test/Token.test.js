const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blarothings Token", function () {
  let Token, token, owner, addr1;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("Blarothings");
    token = await TokenFactory.deploy(owner.address);
    await token.deployed();
  });

  it("Should deploy with correct name and symbol", async () => {
    expect(await token.name()).to.equal("Blarothings");
    expect(await token.symbol()).to.equal("BLR");
  });

  it("Should mint initial supply to msg.sender", async () => {
    const totalSupply = await token.totalSupply();
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(totalSupply);
  });

  it("Should transfer tokens between accounts", async () => {
    await token.transfer(addr1.address, 1000);
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.equal(1000);
  });

  it("Should burn tokens", async () => {
    const initialBalance = await token.balanceOf(owner.address);
    await token.burn(5000);
    const newBalance = await token.balanceOf(owner.address);
    expect(newBalance).to.equal(initialBalance.sub(5000));
  });

  it("Should not burn more than balance", async () => {
    await expect(token.connect(addr1).burn(100)).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });

  it("Should only allow owner to access Ownable functions", async () => {
    await expect(token.connect(addr1).transferOwnership(addr1.address)).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
