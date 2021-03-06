import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import axios from 'axios'


const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')



export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: ''})
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
  async function createMarket() {

    let tokenid = 1
    axios.get("http://127.0.0.1:8000/api/Nfts/").then((response) => {
      tokenid = (response.data.length)+1 ; 
      
    });
    const { name , price } = formInput
    if (!name || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,price, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log(url)
      const sig = await sign(tokenid , price , url)
      console.log(sig)


    const baseURL = "http://127.0.0.1:8000/api/Nfts/";
    const note = {
      
       tokenId : tokenid,
       name : name,
       sig :sig,
       url : url,
       sold :false
    
      }   
      axios.post(baseURL, note)
           
  



      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      //createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
    router.push('/buy')
  }







async function sign(TokenId , Minprice , Uri ) {
    let tokenId = TokenId
    
    const minPrice = ethers.utils.parseUnits(Minprice.toString(),'gwei')
    console.log(minPrice)
    let uri = Uri
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        console.log(signer)

        const signature = await signer._signTypedData(
          // Domain
          {
            name: 'Name',
            version: '1.0.0',
            chainId: 4,
            verifyingContract: "0x1f714beC927CF8a082516bC5d6555116497355c3",
          },
          // Types
          {
            NFTVoucher: [
        {name: "tokenId", type: "uint256"},
        {name: "minPrice", type: "uint256"},
        {name: "uri", type: "string"},

            ],
          },
          // Value
          { tokenId, minPrice ,uri},
        );
        return   signature
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