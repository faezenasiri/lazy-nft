const { expect } = require("chai");

describe('ERC1155Market', function () {
  before(async function() {
    this.accounts = await ethers.getSigners();
  });

  describe('createmarketitem', function () {
    before(async function() {
        
    const Lazy1155 = await ethers.getContractFactory("NewERC1155lazy")
    this.lazy1155 = await Lazy1155.deploy()
    await this.lazy1155.deployed()

    const Lazy1155market = await ethers.getContractFactory("NewERC1155Market")
    this.lazy1155Market = await Lazy1155market.deploy()
    await this.lazy1155Market.deployed()

    this.lazy1155.initMarket(this.lazy1155Market.address);
    this.lazy1155Market.initToken(this.lazy1155.address, 5)
        
    
  });
   
      it('mint and createmarketitem all', async function () {

          await this.lazy1155.mint(10, "token1url", 10);
          await this.lazy1155.aprovalMarketPlacesForAccount()
          let tx = await this.lazy1155Market.createMarketItem(1,1000,10)
          let block = await ethers.provider.getBlock(tx.blockNumber)
          await expect(tx)
          .to.emit(this.lazy1155Market, 'MarketItemCreated')
          .withArgs(1,
            1,
            this.accounts[0].address,
            1000, block.timestamp);   
      

      });


       it('mint and createmarketitem, not list the entire supply ', async function () {

          await this.lazy1155.mint(10, "token2url", 10);
          await this.lazy1155.aprovalMarketPlacesForAccount()
          let price =  ethers.utils.parseEther("0.5")
          let tx = await this.lazy1155Market.createMarketItem(2,price,5)
          let block = await ethers.provider.getBlock(tx.blockNumber)
          await expect(tx)
          .to.emit(this.lazy1155Market, 'MarketItemCreated')
          .withArgs(2,
            2,
            this.accounts[0].address,
            price, block.timestamp);
      
      });




       it('mint and createmarketitem, more than supply - expect revert ', async function () {

          await this.lazy1155.mint(10, "token3url", 10);
          await this.lazy1155.aprovalMarketPlacesForAccount()
          let price =  ethers.utils.parseEther("0.5")

         await expect(this.lazy1155Market.createMarketItem(3,price,12))
        .to.be.revertedWith('ERC1155: insufficient balance for transfer');

      
      });
    
    
    });




  describe('createMarketsale', function () {

    before(async function() {
        
    const Lazy1155 = await ethers.getContractFactory("NewERC1155lazy")
    this.lazy1155 = await Lazy1155.deploy()
    await this.lazy1155.deployed()

    const Lazy1155market = await ethers.getContractFactory("NewERC1155Market")
    this.lazy1155Market = await Lazy1155market.deploy()
    await this.lazy1155Market.deployed()

    this.lazy1155.initMarket(this.lazy1155Market.address);
    this.lazy1155Market.initToken(this.lazy1155.address, 5)
        
    
  });

  it('buy some tokens', async function () {

          await this.lazy1155.mint(10, "token1url", 10);
          await this.lazy1155.aprovalMarketPlacesForAccount()
          let price =  ethers.utils.parseEther("0.5")
          let value =  ethers.utils.parseEther("1.5")
          await this.lazy1155Market.createMarketItem(1,price,5)
          let tx = await this.lazy1155Market.connect(this.accounts[2]).createMarketSale(1,3, {value: value})  
          await expect(tx)
          .to.emit(this.lazy1155Market, 'MarketItemSold')
          .withArgs(1,
            1,
            this.accounts[0].address,this.accounts[2].address,
            3);
      
  });


  it('buy some tokens , dont pay enough', async function () {

          await this.lazy1155.mint(10, "token1url", 10);
          await this.lazy1155.aprovalMarketPlacesForAccount()
          let price =  ethers.utils.parseEther("0.5")
          let value =  ethers.utils.parseEther("1")
          await this.lazy1155Market.createMarketItem(1,price,5)
          await expect(this.lazy1155Market.connect(this.accounts[2]).createMarketSale(1,3, {value: value}) ).to.be.revertedWith('You should include the price of the item');

      
  });


  });


  describe('lazy 1155', function () {

    before(async function() {
        
    const Lazy1155 = await ethers.getContractFactory("NewERC1155lazy")
    this.lazy1155 = await Lazy1155.deploy()
    await this.lazy1155.deployed()

    const Lazy1155market = await ethers.getContractFactory("NewERC1155Market")
    this.lazy1155Market = await Lazy1155market.deploy()
    await this.lazy1155Market.deployed()

    this.lazy1155.initMarket(this.lazy1155Market.address);
    this.lazy1155Market.initToken(this.lazy1155.address, 5)
        
    
  });

 it('buy lazy all elements', async function () {
   
        let tokenId = 3
        let minPrice = ethers.utils.parseUnits(0.001.toString(),'ether')
        let amount = 10
        let uri = "token3uri"
        let royaltyPercentage = 10
        const signature = await this.accounts[1]._signTypedData(
          // Domain
          {
            name: 'Name',
            version: '1.0.0',
            chainId: 1337,
            verifyingContract: this.lazy1155.address,
          },
          // Types
          {
              
       NFTVoucher: [
        {name: "tokenId", type: "uint256"},
        {name: "minPrice", type: "uint256"},
        {name: "amount", type: "uint256"},
        {name: "uri", type: "string"},
        {name: "royaltyPercentage", type: "uint256"},

            ],
          },
          // Value
          {tokenId,minPrice,amount,uri,royaltyPercentage},
        );
        let value = ethers.utils.parseUnits(0.01.toString(),'ether')
        await (this.lazy1155Market.connect(this.accounts[2]).buylazyitem( {tokenId,minPrice,amount,uri,royaltyPercentage}, signature,10,{value: value}))
        expect(await this.lazy1155.balanceOf(this.accounts[2].address,1)).to.equal(10);

      });

  
   
      it('buy lazy all elements', async function () {
   
        let tokenId = 3
        let minPrice = ethers.utils.parseUnits(0.001.toString(),'ether')
        let amount = 10
        let uri = "token3uri"
        let royaltyPercentage = 10
        const signature = await this.accounts[1]._signTypedData(
          // Domain
          {
            name: 'Name',
            version: '1.0.0',
            chainId: 1337,
            verifyingContract: this.lazy1155.address,
          },
          // Types
          {
              
       NFTVoucher: [
        {name: "tokenId", type: "uint256"},
        {name: "minPrice", type: "uint256"},
        {name: "amount", type: "uint256"},
        {name: "uri", type: "string"},
        {name: "royaltyPercentage", type: "uint256"},

            ],
          },
          // Value
          {tokenId,minPrice,amount,uri,royaltyPercentage},
        );
        
        await (this.lazy1155Market.connect(this.accounts[2]).buylazyitem( {tokenId,minPrice,amount,uri,royaltyPercentage}, signature,3,{value: minPrice*3}))
        expect(await this.lazy1155.balanceOf(this.accounts[2].address,2)).to.equal(3);
        expect(await this.lazy1155.balanceOf(this.lazy1155Market.address,2)).to.equal(7);


      });
    
  });
});
