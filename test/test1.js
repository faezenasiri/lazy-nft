const { expect } = require("chai");
const truffleAssert = require('truffle-assertions');
describe('ERC1155Market', function () {
  before(async function() {
    this.accounts = await ethers.getSigners();
  });



  describe("Deployment - deployment correctness, constructor and initial storage variables", function() {
    before(async function() {
    const Lazy1155 = await ethers.getContractFactory("NewERC1155Lazy")
    this.lazy1155 = await Lazy1155.deploy()
    await this.lazy1155.deployed()
  });

   it("check contract name", async function () {  
    assert.equal(await this.lazy1155.name(), "nft", "incorrect name.");
   });
    

   it("check contract symbol", async function () {
     assert.equal(await this.lazy1155.symbol(), "nft", "incorrect symbol.");
    });
    
    
  })




  describe("Ownability - initial ownership and transfer ownership", function() {
    before(async function() {
          this.accounts = await ethers.getSigners();

    const Lazy1155 = await ethers.getContractFactory("NewERC1155Lazy")
    this.lazy1155 = await Lazy1155.deploy()
    await this.lazy1155.deployed()
  });


   it("check contract initial owner", async function () {  
    assert.equal(await this.lazy1155.owner(), this.accounts[0].address, "incorrect owner.");
   });
    

   it("check contract transfer ownership", async function () {
      let initialOwner = this.accounts[0].address;
      let newOwner = this.accounts[1].address;

       await expect(await this.lazy1155.transferOwnership(newOwner))
            .to.emit(this.lazy1155, 'OwnershipTransferred')
            .withArgs(initialOwner, newOwner);

      
      assert.equal(await this.lazy1155.owner(), newOwner, "incorrect transfer ownership.");
      assert.notEqual(await this.lazy1155.owner(), initialOwner, "incorrect transfer ownership.");      
        

    });
    
    
  })  




  describe("Mint - create token scenarios", function () {
    before(async function() {
    const Lazy1155 = await ethers.getContractFactory("NewERC1155Lazy")
    this.lazy1155 = await Lazy1155.deploy()
    await this.lazy1155.deployed()
    });
    it("mint new token", async function () {
          

        

      
      const [owner,owner2] = await ethers.getSigners();
      let  tx = await this.lazy1155.mint(10, "lalala", 10);
      let addresszero =  ethers.constants.AddressZero  

      await expect(tx)
            .to.emit(this.lazy1155, 'TransferSingle')
            .withArgs(owner.address, addresszero, owner.address, 1, 10);
        
      expect(await this.lazy1155.balanceOf(owner.address,1)).to.equal(10);
      await expect(this.lazy1155.connect(owner2).mint(10, "lalala", 10))
            .to.emit(this.lazy1155, 'TransferSingle')
            .withArgs(owner2.address, addresszero, owner2.address, 2, 10);
        


    
    });

     });

 
 

 describe("Burn - delete token scenarios", function ()  {
    before(async function() {
    const Lazy1155 = await ethers.getContractFactory("NewERC1155Lazy")
    this.lazy1155 = await Lazy1155.deploy()
    await this.lazy1155.deployed()
    });
    it("burn created token by creator", async function ()  {
      // deploy contract
        
     

const [owner,owner2] = await ethers.getSigners();
      let  tx = await this.lazy1155.mint(10, "lalala", 10);
      let addresszero =  ethers.constants.AddressZero  
      var burnTokenTransaction = await this.lazy1155.burn(owner.address,1,10);


       await expect(burnTokenTransaction)
            .to.emit(this.lazy1155, 'TransferSingle')
            .withArgs(owner.address, owner.address,addresszero,1,10);
        
         await expect(burnTokenTransaction)
            .to.emit(this.lazy1155, 'TokenBurnt')
            .withArgs(owner.address, 1,10);
            

 

    });



  });



  
})
