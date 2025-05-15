const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAOGovernance", function () {
  let DAO, dao, owner, addr1, addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const DAOFactory = await ethers.getContractFactory("DAOGovernance");
    dao = await DAOFactory.deploy(100);
    await dao.deployed();
  });

  it("Should deploy with correct minVotesRequired", async () => {
    expect(await dao.minVotesRequired()).to.equal(100);
  });

  it("Should allow the owner to assign voting power", async () => {
    await dao.assignVotingPower(addr1.address, 50);
    expect(await dao.votingPower(addr1.address)).to.equal(50);
  });

  it("Should not allow non-owners to assign voting power", async () => {
    await expect(
      dao.connect(addr1).assignVotingPower(addr2.address, 30)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should allow the owner to create a proposal", async () => {
    await dao.assignVotingPower(owner.address, 100);
    await expect(
      dao.createProposal("Test Proposal", ethers.constants.AddressZero, 0, false)
    ).to.emit(dao, "ProposalCreated");
  });

  it("Should allow voting on a proposal", async () => {
    await dao.assignVotingPower(owner.address, 100);
    await dao.createProposal("Vote Proposal", ethers.constants.AddressZero, 0, false);
    await expect(dao.vote(1))
      .to.emit(dao, "Voted")
      .withArgs(1, owner.address, 100);
  });

  it("Should not allow duplicate votes", async () => {
    await dao.assignVotingPower(owner.address, 100);
    await dao.createProposal("Vote Twice", ethers.constants.AddressZero, 0, false);
    await dao.vote(1);
    await expect(dao.vote(1)).to.be.revertedWith("Already voted");
  });

  it("Should execute a proposal if votes >= minVotesRequired", async () => {
    await dao.assignVotingPower(owner.address, 100);
    await dao.createProposal("Toggle state", ethers.constants.AddressZero, 0, true);
    await dao.vote(1);
    await dao.executeProposal(1);

    const results = await dao.getProposalResults(1);
    expect(results.executed).to.be.true;
    expect(await dao.someState()).to.equal(true);
  });

  it("Should not execute a proposal if votes < minVotesRequired", async () => {
    await dao.assignVotingPower(owner.address, 50); // Less than required
    await dao.createProposal("Not enough votes", ethers.constants.AddressZero, 0, true);
    await dao.vote(1);
    await expect(dao.executeProposal(1)).to.be.revertedWith("Not enough votes to execute");
  });

  it("Should transfer Ether to recipient on execution", async () => {
    await dao.assignVotingPower(owner.address, 100);

    // Send Ether to contract
    await owner.sendTransaction({ to: dao.address, value: ethers.utils.parseEther("1") });

    // addr1 starts with 0 ether
    const initialBalance = await ethers.provider.getBalance(addr1.address);

    await dao.createProposal("Fund transfer", addr1.address, ethers.utils.parseEther("0.5"), false);
    await dao.vote(1);
    await dao.executeProposal(1);

    const finalBalance = await ethers.provider.getBalance(addr1.address);
    expect(finalBalance.sub(initialBalance)).to.be.closeTo(ethers.utils.parseEther("0.5"), ethers.utils.parseEther("0.01"));
  });
});
