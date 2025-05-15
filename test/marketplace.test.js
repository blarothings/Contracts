const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
    let BLRToken, blrToken, Marketplace, marketplace;
    let owner, seller, buyer;

    beforeEach(async () => {
        [owner, seller, buyer] = await ethers.getSigners();

        BLRToken = await ethers.getContractFactory("MockERC20");
        blrToken = await BLRToken.deploy("BLR Token", "BLR", 18);
        await blrToken.mint(seller.address, ethers.utils.parseUnits("1000", 18));
        await blrToken.mint(buyer.address, ethers.utils.parseUnits("1000", 18));

        Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy(blrToken.address, 500); // 5% fee
    });

    it("should allow listing shares", async () => {
        const poolAddress = "0x000000000000000000000000000000000000dead";
        await expect(marketplace.connect(seller).listShares(poolAddress, 100, 10))
            .to.emit(marketplace, "SharesListed")
            .withArgs(poolAddress, seller.address, 100, 10);
    });

    it("should accumulate fees after purchase", async () => {
        const poolAddress = "0x000000000000000000000000000000000000dead";
        await marketplace.connect(seller).listShares(poolAddress, 100, 10);

        await blrToken.connect(buyer).approve(marketplace.address, ethers.utils.parseUnits("1000", 18));

        await expect(marketplace.connect(buyer).purchaseShares(poolAddress, 0, 10))
            .to.emit(marketplace, "SharesPurchased")
            .withArgs(poolAddress, buyer.address, seller.address, 10, 105);

        const fees = await marketplace.accumulatedFees();
        expect(fees).to.be.gt(0);
    });
});