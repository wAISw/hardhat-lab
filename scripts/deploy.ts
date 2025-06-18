import { ethers } from 'hardhat';

async function main() {
  const counter = await ethers.deployContract('Counter');
  await counter.waitForDeployment();

  console.log(`Counter deployed to: ${await counter.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
