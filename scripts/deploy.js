const hre = require("hardhat");
const fs = require('fs');

async function main() {
  



  const NewERC1155lazy = await hre.ethers.getContractFactory("NewERC1155Lazy");
  const NEWERC1155lazy = await NewERC1155lazy.deploy();
  await NEWERC1155lazy.deployed();
  console.log("lazy deployed to:", NEWERC1155lazy.address);

  const NewERC1155Market = await hre.ethers.getContractFactory("NewERC1155Market");
  const NEWRC1155Market = await NewERC1155Market.deploy();
  await NEWRC1155Market.deployed();
  console.log("lazy deployed to:", NEWRC1155Market.address);


  await NEWRC1155Market.initToken(NEWERC1155lazy.address ,5)
    await NEWERC1155lazy.initMarket(NEWRC1155Market.address)


    
  fs.writeFileSync('./config.js', `
  export const ERC1155addr = "${NEWERC1155lazy.address}"\n export const ERC1155Marketaddr = "${NEWRC1155Market.address}"
  `)


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
