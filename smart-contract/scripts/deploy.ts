import { ethers } from "hardhat";

async function main() {


  const [deployer] = await ethers.getSigners();

  console.log(`\nDeploying piggy factory with account: ${deployer.address}`);
  
  // Deploy PiggyFactory contract
  const PiggyFactory = await ethers.getContractFactory("PiggybankFactory");
  const piggyFactory = await PiggyFactory.deploy();
  await piggyFactory.waitForDeployment();
  const deployedAddress = await piggyFactory.getAddress();
  console.log(`\npiggy factory deployed to: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
