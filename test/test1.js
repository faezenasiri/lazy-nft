const { expect } = require("chai");
describe("NewERC1155Lazy", function() {
    before(async function() {
    this.accounts = await ethers.getSigners();
  });


  

  it("Should works!", async function() {
    const Lazy1155 = await ethers.getContractFactory("NewERC1155Lazy")
    const lazy1155 = await Lazy1155.deploy()
    await lazy1155.deployed()
    
    const [owner,owner2] = await ethers.getSigners();
    let  tx = await lazy1155.mint(10, "lalala", 10);
    let addresszero =  ethers.constants.AddressZero  

    await expect(tx)
          .to.emit(lazy1155, 'TransferSingle')
          .withArgs(owner.address, addresszero, owner.address, 1, 10);
      
    expect(await lazy1155.balanceOf(owner.address,1)).to.equal(10);
    await expect(lazy1155.connect(owner2).mint(10, "lalala", 10))
          .to.emit(lazy1155, 'TransferSingle')
          .withArgs(owner2.address, addresszero, owner2.address, 2, 10);
      


  })
})
