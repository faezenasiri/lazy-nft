import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"




import Lazy from '../artifacts/contracts/Lazy.sol/Lazy.json'


import {
  Lazyaddr
} from '../config'



export default function Home() {



  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {

loadNFTs()




const chainId = 4 // Polygon Mainnet
const x = window.ethereum.networkVersion 
if (x == chainId ) {
       {
        console.log(window.ethereum.networkVersion)
       
     console.log(window.ethereum.networkVersion)
      } 
      
          // This error code indicates that the chain has not been added to MetaMask      
    }
    else {
      alert("connect to rinkeby")
    }

    
  }, [])
  let data 
  async function loadNFTs() {

     await axios.get("http://127.0.0.1:8000/api/Nfts/").then((response) => {
       data = response.data
    });
    
    
    const items = await Promise.all(data.map(async i => {
      const tokenUri = i.url
      const sig = i.sig
      const tokenId = i.tokenId
      const meta = await axios.get(tokenUri)
      let item = {
        tokenUri,
        tokenId,
        sig,
        price : meta.data.price,
        image: meta.data.image,
        name: meta.data.name,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }

  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer =  provider.getSigner()
    const addr = await signer.getAddress()

    console.log(addr)
    const contract = new ethers.Contract(Lazyaddr, Lazy.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(),'ether')
    const price2 = nft.price*10**18

    
    console.log(nft.price)

    const sig = nft.sig
    const transaction = await contract.redeem(addr,{tokenId:nft.tokenId ,minPrice:nft.price*1000, uri:nft.tokenUri},sig, {
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
