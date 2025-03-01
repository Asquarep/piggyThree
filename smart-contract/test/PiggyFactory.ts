import { expect } from "chai";
import { ethers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { parseEther } from "ethers";

describe("PiggybankFactory and Piggybank Contracts with USDC", function () {
  const USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const IMPERSONATED_USER = "0x1ac1A8FEaAEa1900C4166dEeed0C11cC10669D36";

  async function deployContracts() {
    const [owner] = await ethers.getSigners();

    // Deploy the PiggybankFactory contract
    const PiggybankFactory = await ethers.getContractFactory("PiggybankFactory");
    const factory = await PiggybankFactory.deploy();
    await factory.waitForDeployment();

    return { factory, owner };
  }

  async function setupImpersonatedUser() {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [IMPERSONATED_USER],
    });

    const impersonatedSigner = await ethers.getSigner(IMPERSONATED_USER);

    // Fund the impersonated account with ETH for gas fees
    const [deployer] = await ethers.getSigners();
    await deployer.sendTransaction({
      to: IMPERSONATED_USER,
      value: parseEther("1"),
    });

    return impersonatedSigner;
  }

  describe("Impersonation and Approvals", function () {
    it("Should allow the impersonated user to create a Piggybank, approve USDC, and deposit", async function () {
      const { factory, owner } = await loadFixture(deployContracts);
      const impersonatedUser = await setupImpersonatedUser();

      // Add USDC as an allowed token
      await factory.connect(owner).updateAllowedTokens([USDC_ADDRESS]);

      // Create a Piggybank
      await factory.connect(impersonatedUser).createPiggybank("Save for retirement", 12);
      const piggybanks = await factory.getPiggybanks();
      expect(piggybanks.length).to.equal(1);

      const piggybankAddress = piggybanks[0];
      expect(await factory.piggybankOwners(piggybankAddress)).to.equal(impersonatedUser.address);

      // Get the Piggybank contract instance
      const piggybank = await ethers.getContractAt("Piggybank", piggybankAddress);

      // Get USDC contract
      const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);

      // Approve Piggybank contract to spend USDC
      await usdc.connect(impersonatedUser).approve(piggybank.address, ethers.utils.parseUnits("100", 6));

      // Deposit into Piggybank
      await piggybank.connect(impersonatedUser).deposit(USDC_ADDRESS, ethers.utils.parseUnits("100", 6));

      // Verify deposit balance
      expect(await piggybank.balances(USDC_ADDRESS)).to.equal(ethers.utils.parseUnits("100", 6));
    });
  });
});
