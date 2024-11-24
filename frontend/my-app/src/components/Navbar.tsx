import Link from 'next/link'
import React from 'react'

function Navbar() {
  return (
    <div className='w-10/12 rounded-full bg-[#000] h-20 mx-auto mt-12  flex justify-between px-16 items-center '>
        <div className="logo font-bold text-2xl ">
            SpeechSync
        </div>
        <div className="menu">
            <ul className='flex gap-5'>
                <li><Link href={"/"}>Home</Link></li>
                <li><Link href={"/product"}>Product</Link></li>
                <li><a href="#">Pricing</a></li>
            </ul>
        </div>
        {/* <div className="btn">
            <button className='px-6 py-2 bg-white text-black rounded-3xl font-medium text-lg'>Login</button>
        </div> */}
    </div>
  )
}

export default Navbar