import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"


import {
  ERC1155addr,ERC1155Marketaddr
} from '../config'

import NewERC1155lazy from '../artifacts/contracts/NewERC1155lazy.sol/NewERC1155lazy.json'
import NewERC1155Market from '../artifacts/contracts/NewERC1155Market.sol/NewERC1155Market.json'



export default function Home() {


  const [formInput, updateFormInput] = useState({ amount: ''})

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
      const id = i.id
      const tokenUri = i.url
      const sig = i.sig
      const sold = i.sold
      const tokenId = i.tokenId
      let amount = i.amount
      const royal = i.royal
      const meta = await axios.get(tokenUri)
      let item = {
        sold,
        id,
        tokenUri,
        tokenId,
        sig,
        amount,
        price : meta.data.price,
        image: meta.data.image,
        name: meta.data.name,
        royal
      }
      return item
    }))
    setNfts(items)
  
  }



  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer =  provider.getSigner()
    const addr = await signer.getAddress()

    

    //console.log(addr)
 


    let contract = new ethers.Contract(ERC1155Marketaddr, NewERC1155Market.abi, signer)
    const price2 = ethers.utils.parseUnits(nft.price.toString(),'gwei')

    let tokenId = nft.tokenId 
    let minPrice = price2
    let uri = nft.tokenUri
    let royaltyPercentage = nft.royaltyPercentage
    

    const sig = nft.sig
    console.log(contract)
    amount = parseInt(nft.amount)
    let amounts = parseInt(formInput.amount)
    let nftprice = parseInt(nft.price)
    const price = ethers.utils.parseUnits((nftprice*amounts).toString(),'ether')

    console.log(price)
    tokenId =nft.tokenId
    minPrice =price2
    uri = nft.tokenUri
    amount=nft.amount
    royaltyPercentage=nft.royal
     const transaction = await contract.buylazyitem({tokenId ,minPrice ,uri,amount,royaltyPercentage}, sig,amounts,{
      value: price
    })
    await transaction.wait()
    

    let baseURL = `http://127.0.0.1:8000/api/Nfts/${nft.id}/`;
    let Name = nft.name
    let URL = nft.tokenUri
    let ID = nft.tokenId
    let note = {
      
       tokenId : ID,
       name : Name,
       sig :addr,
       url :URL,
       sold : true
    
      }   
      axios.put(baseURL, note)


    baseURL = 'http://127.0.0.1:8000/api/Nfts1155/';
     Name = nft.name
     URL = nft.tokenUri
     ID = nft.tokenId
    let amount = nft.amount
    let amountLeft = amount - formInput.amount
     royaltyPercentage = nft.royal
     note = {
      
       tokenId : ID,
       name : Name,
       url :URL,
       sold : Boolean(amountLeft-formInput.amount),
       amount:amount,
       amountLeft:amountLeft,
       royaltyPercentage : royaltyPercentage
       
      }   
     



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
                           <input
                placeholder="amount"
                className="mt-2 border rounded p-4"
                onChange={e => updateFormInput({ ...formInput, amount: e.target.value })}
                />

                 {1 && <div className="p-4 bg-black">
                    <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>

                    
                    <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                  </div>}
                 
                </div>
              ))
          }
        </div>
      </div>
    </div>
    </div>
  )
}
