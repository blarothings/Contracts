const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("Blarothings");
  const token = await Token.deploy(deployer.address);
  await token.deployed();

  console.log("Blarothings Token deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
