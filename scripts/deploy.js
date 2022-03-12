const hre = require("hardhat");
const fs = require('fs');

async function main() {
  

  const Lazy = await hre.ethers.getContractFactory("Lazy");
  const LAZY = await Lazy.deploy();
  await LAZY.deployed();
  console.log("lazy deployed to:", LAZY.address);


  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
