import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`\nDeploying onchain NFT with account: ${deployer.address}`);
  
  // Deploy PeteOnChainNFT contract
  const PeteOnChainNFT = await ethers.getContractFactory("PeteOnChainNFT");
  const onchainNFT = await PeteOnChainNFT.deploy("PeteOnChainNFT", "PNFT", deployer.address);
  await onchainNFT.waitForDeployment();
  const deployedAddress = await onchainNFT.getAddress();
  console.log(`\nOnchain NFT deployed to: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
