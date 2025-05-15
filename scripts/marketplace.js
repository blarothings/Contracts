const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying Marketplace with the account:", deployer.address);

    const blrTokenAddress = "0xYourBLRTokenAddress"; // replace with actual BLR token address
    const tradingFee = 500; // 5% fee, adjust as needed

    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(blrTokenAddress, tradingFee);
    await marketplace.deployed();

    console.log("Marketplace deployed to:", marketplace.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});