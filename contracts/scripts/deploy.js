const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DelayClaim contracts to Flare Coston2...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "C2FLR\n");

  // 1. Deploy MockFDCVerifier (for demo)
  console.log("1. Deploying MockFDCVerifier...");
  const MockFDCVerifier = await ethers.getContractFactory("MockFDCVerifier");
  const mockVerifier = await MockFDCVerifier.deploy();
  await mockVerifier.waitForDeployment();
  const verifierAddress = await mockVerifier.getAddress();
  console.log("   MockFDCVerifier deployed to:", verifierAddress);

  // 2. Deploy DelayClaimInsurance
  console.log("\n2. Deploying DelayClaimInsurance...");
  const DelayClaimInsurance = await ethers.getContractFactory("DelayClaimInsurance");
  const insurance = await DelayClaimInsurance.deploy(verifierAddress);
  await insurance.waitForDeployment();
  const insuranceAddress = await insurance.getAddress();
  console.log("   DelayClaimInsurance deployed to:", insuranceAddress);

  // 3. Fund the pool with initial liquidity
  console.log("\n3. Funding insurance pool with 10 C2FLR...");
  const fundTx = await insurance.fundPool({ value: ethers.parseEther("10") });
  await fundTx.wait();
  console.log("   Pool funded successfully!");

  const poolBalance = await insurance.poolBalance();
  console.log("   Pool balance:", ethers.formatEther(poolBalance), "C2FLR");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:              Flare Coston2");
  console.log("MockFDCVerifier:     ", verifierAddress);
  console.log("DelayClaimInsurance: ", insuranceAddress);
  console.log("Pool Balance:        ", ethers.formatEther(poolBalance), "C2FLR");
  console.log("=".repeat(60));

  console.log("\nUpdate your frontend .env with:");
  console.log(`VITE_CONTRACT_ADDRESS=${insuranceAddress}`);
  console.log(`VITE_FDC_VERIFIER_ADDRESS=${verifierAddress}`);

  console.log("\nUpdate your backend .env with:");
  console.log(`CONTRACT_ADDRESS=${insuranceAddress}`);
  console.log(`FDC_VERIFIER_ADDRESS=${verifierAddress}`);

  // Verify on explorer
  console.log("\nVerify contracts on Coston2 Explorer:");
  console.log(`https://coston2-explorer.flare.network/address/${insuranceAddress}`);
  console.log(`https://coston2-explorer.flare.network/address/${verifierAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
