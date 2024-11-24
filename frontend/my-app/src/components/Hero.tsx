import Link from 'next/link'
import React from 'react'

function Hero() {
  return (
    <div className='w-full  mt-20  flex flex-col justify-center items-center text-white'>
        <h1 className='w-[20ch]   text-[92px] font-bold text-center '>Generate Subtitles for Any Video in Seconds.</h1>
        <p className='text-gray-500 my-0 text-lg'>Upload your video, choose a language, and get perfectly synced subtitles.</p>
        <div className="btn">
            <Link href={"/product"}><button  className='px-6 py-2 rounded-full bg-white text-black mt-10 font-medium text-md drop-shadow-[0_15px_25px_rgba(255,255,255,0.35)]'>Try Now</button></Link>
            <button className='px-6 py-2 rounded-full underline text-gray-300 mt-10 font-medium text-md'>Contact Us</button>
        </div>

    </div>
  )
}

export default Hero