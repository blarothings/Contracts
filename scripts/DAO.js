const { ethers } = require("hardhat");

async function main() {
  const minVotesRequired = 100;

  const DAO = await ethers.getContractFactory("DAOGovernance");
  const dao = await DAO.deploy(minVotesRequired);
  await dao.deployed();

  console.log("DAOGovernance deployed to:", dao.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
