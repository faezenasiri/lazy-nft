require("@nomiclabs/hardhat-waffle");
//const fs = require('fs');
// const privateKey = fs.readFileSync(".secret").toString().trim() || "01234567890123456789";
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    
    rinkeby: {
    // Infura
       url: "https://rinkeby.infura.io/v3/a8b52e4b2b824890a2c335a55c3df3c6",
     
      accounts: ["9aefa31005f2be2da94fa10f7fad080b636dd136e33a278711608086bfd9ac2e"]
    },
    /*
    matic: {
      // Infura
      // url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [privateKey]
    }
    */
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};

