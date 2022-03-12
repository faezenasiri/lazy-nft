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
     
      accounts: ["42c15c9a97b13e9bd7afdf9d20c8fb8c7a5591137fd59e8409e404efe35b07d3"]
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

