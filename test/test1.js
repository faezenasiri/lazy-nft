describe("Lazy1155", function() {
  it("Should works!", async function() {
    const Lazy1155 = await ethers.getContractFactory("Lazy1155")
    const lazy1155 = await Lazy1155.deploy()
    await lazy1155.deployed()
    const lazy1155address = lazy1155.address

  })
})
