import '../styles/globals.css'
import Link from 'next/link'


function Marketplace({ Component, pageProps }) {
  return (
    <div>
  
        <nav className="border-b p-6">
 
        <div className="flex mt-4">
  
          <Link href="/buy">
            <a className="mr-6 text-pink-500">
              Buy
            </a>
          </Link>
          <Link href="/create">
            <a className="mr-6 text-pink-500">
              Create
            </a>
          </Link>

          <Link href="/newcreate">
            <a className="mr-6 text-pink-500">
              Create1155
            </a>
          </Link>
          <Link href="/newbuy1155">
            <a className="mr-6 text-pink-500">
              Buy1155
            </a>
          </Link>

        </div>
      </nav>
 
        

        
     
      <Component {...pageProps} />
    </div>
  )
}

export default Marketplace