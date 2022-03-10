import '../styles/globals.css'
import Link from 'next/link'
import Profile from '../component/profile'


function Marketplace({ Component, pageProps }) {
  return (
    <div>
  
          <nav className="border-b p-6">
 
        

        
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default Marketplace