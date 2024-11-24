// import Image from "next/image";

import Hero from "@/components/Hero";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
    <div className="container h-screen flex flex-col w-screen  mx-auto  font-[family-name:var(--font-geist-sans)] ">
      <Navbar/> 
      <Hero/>
    </div>
    </>
  );
}
