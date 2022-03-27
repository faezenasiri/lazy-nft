const hre = require("hardhat");
const fs = require('fs');

async function main() {
  



  const Lazy1155 = await hre.ethers.getContractFactory("Lazy1155");
  const LAZY1155 = await Lazy1155.deploy();
  await LAZY1155.deployed();
  console.log("lazy deployed to:", LAZY1155.address);
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
