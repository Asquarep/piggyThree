import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("PeteOnChainNFT Contract", () => {
  const deployContract = async () => {
    const [owner, user] = await ethers.getSigners();

    const PeteOnChainNFT = await ethers.getContractFactory("PeteOnChainNFT");
    const nftContract = await PeteOnChainNFT.deploy("Pete", "PETE", owner.address);

    return { nftContract, owner, user };
  };

  describe("Minting NFTs", function () {
    it("Should allow the owner to mint a new NFT", async function () {
      const { nftContract, owner } = await loadFixture(deployContract);

      await nftContract.mint();
      expect(await nftContract.balanceOf(owner.address)).to.equal(1);
      expect(await nftContract.ownerOf(1)).to.equal(owner.address);
    });

    it("Should allow minting an NFT for a specific address", async function () {
      const { nftContract, user } = await loadFixture(deployContract);

      await nftContract.mintForAddress(user.address);
      expect(await nftContract.balanceOf(user.address)).to.equal(1);
      expect(await nftContract.ownerOf(1)).to.equal(user.address);
    });
  });

  describe("Token URI Generation", function () {
    it("Should generate a valid token URI", async function () {
      const { nftContract, owner } = await loadFixture(deployContract);

      await nftContract.mint();
      const tokenURI = await nftContract.tokenURI(1);
      expect(tokenURI).to.include("data:application/json;base64,");
    });
  });

  describe("Ownership and Transfers", function () {
    it("Should allow NFT transfer between accounts", async function () {
      const { nftContract, owner, user } = await loadFixture(deployContract);

      await nftContract.mint();
      await nftContract["safeTransferFrom(address,address,uint256)"](owner.address, user.address, 1);
      expect(await nftContract.balanceOf(user.address)).to.equal(1);
      expect(await nftContract.ownerOf(1)).to.equal(user.address);
    });
  });
});
