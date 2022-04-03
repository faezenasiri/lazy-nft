import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import axios from 'axios'
import {
  ERC1155addr,ERC1155Marketaddr
} from '../config'

import NewERC1155lazy from '../artifacts/contracts/NewERC1155lazy.sol/NewERC1155lazy.json'
import NewERC1155Market from '../artifacts/contracts/NewERC1155Market.sol/NewERC1155Market.json'


const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')



export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '',amount: '',royalty:''})
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }





  async function uploadtoipfs() {

   
  
    const { name , price , amount ,royalty} = formInput
    if (!name || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,price, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`

      return url
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      //createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
   
  }








  async function createMarket() {

      const url = await uploadtoipfs()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* create the NFT */
      let contract = new ethers.Contract(ERC1155addr, NewERC1155lazy.abi, signer)
      let transaction = await contract.mint(formInput.amount,url,formInput.royalty)
      let tx = await transaction.wait()
          let event = tx.events[1]
    let value = event.args[1]
    let d=  await contract.isMArketPlaceActiveForAccount()
if (!d) {
      transaction = await contract.aprovalMarketPlacesForAccount()
      tx = await transaction.wait()

      
}

   

    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')
  
    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(ERC1155Marketaddr, NewERC1155Market.abi, signer)

    /* sending data to backend nftid idstr cat */



    transaction = await contract.createMarketItem( tokenId, price,formInput.amount)
    tx=await transaction.wait()
          const baseURL = "http://127.0.0.1:8000/api/Nfts1155/";
    const note = {
      
       tokenId : tokenId,
       name : formInput.name,
       url : url,
       sold :false,
       amount :formInput.amount,
       amountLeft : formInput.amount,
       royaltyPercentage :formInput.royalty
    
      }   
      axios.post(baseURL, note)
           

  }








    




  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />

        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />

        <input
          placeholder="amount"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, amount: e.target.value })}
        />
       <input
          placeholder="royalty"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, royalty: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={createMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create 
        </button>
      </div>
    </div>
  )
}