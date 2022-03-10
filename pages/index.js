import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"



import {
  Lazyaddr
} from '../config'




export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {    
    
    
      const meta = await axios.get('https://ipfs.infura.io/ipfs/QmWuYamawaJ8SaHp8QVHWudGMNupNHkp7QR41c6oaqYKKy')
      let item = {
        price : meta.data.price,
        image: meta.data.image,
        name: meta.data.name,
        
      }
   
    setNfts([item])
    setLoadingState('loaded') 
  }





  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer =  provider.getSigner()
    const addr = signer.getAddress()
    console.log(addr)
    const contract = new ethers.Contract(Lazyaddr, Lazy.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const sig = "0x286a7ce1958863a642e24a2298d055d3b5ccc500b3f7cc4a1251e042babecb862250466cf3c4836e5e4742dc4fe37f6f062424c69e840d0f2ea04810830c601d1c"
    const transaction = await contract.redeem('0xdD2FD4581271e230360230F9337D5c0430Bf44C0',{tokenId:13 ,minPrice:price, uri:'https://ipfs.infura.io/ipfs/QmWuYamawaJ8SaHp8QVHWudGMNupNHkp7QR41c6oaqYKKy'},sig, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }




  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div>
    
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <div className="flex-shrink-0">
                <a>
                  <img
                    className="h-64 w-full object-cover object-center"
                    src={nft.image}
                    alt=""
                  />
                  </a>
               

                </div>
                  <div className="p-4">
                    <a style={{ height: '64px' }} className="text-2xl font-semibold"><p>{nft.name}</p></a>
                     
                   
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                    
                    <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
    </div>
  )
}
