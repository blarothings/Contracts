const hre = require("hardhat");

async function main() {
  const [deployer, user] = await hre.ethers.getSigners();

  const BLR = await hre.ethers.getContractFactory("Blarothings");
  const blr = await BLR.deploy(deployer.address);
  await blr.deployed();
  console.log("BLR deployed to:", blr.address);

  const Staking = await hre.ethers.getContractFactory("BLRStaking");
  const staking = await Staking.deploy(blr.address);
  await staking.deployed();
  console.log("Staking deployed to:", staking.address);

  const amount = hre.ethers.utils.parseEther("500");

  const tx1 = await blr.transfer(user.address, amount);
  await tx1.wait();

  const tx2 = await blr.connect(user).approve(staking.address, amount);
  await tx2.wait();

  const duration = 30 * 24 * 60 * 60;
  const tx3 = await staking.connect(user).stake(amount, duration, false);
  await tx3.wait();
  console.log(`User staked ${amount.toString()} BLR`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});