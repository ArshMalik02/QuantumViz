import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mic, Sparkles } from "lucide-react"
import logo from "@/public/logo.png"
import leftNet from "@/public/left_net.png"
import rightNet from "@/public/right_net.png"
import leftLight from "@/public/left_light.png"
import rightLight from "@/public/right_light.png"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-transparent to-orange-600/20" />
      
      {/* Left network and light images */}
      <div className="absolute left-0 bottom-0 w-1/4 h-1/2">
        <Image
          src={leftNet}
          alt="Left network"
          layout="fill"
          objectFit="contain"
          objectPosition="left bottom"
          quality={100}
          priority
        />
        <Image
          src={leftLight}
          alt="Left light"
          layout="fill"
          objectFit="contain"
          objectPosition="left bottom"
          quality={100}
          priority
        />
      </div>
      
      {/* Right network and light images */}
      <div className="absolute right-0 top-0 w-1/4 h-1/2">
        <Image
          src={rightNet}
          alt="Right network"
          layout="fill"
          objectFit="contain"
          objectPosition="right top"
          quality={100}
          priority
        />
        <Image
          src={rightLight}
          alt="Right light"
          layout="fill"
          objectFit="contain"
          objectPosition="right top"
          quality={100}
          priority
        />
      </div>
      
      {/* Header */}
      <header className="flex items-center p-8 z-10">
        <Image
          src={logo}
          alt="QuantumViz Logo"
          width={40}
          height={40}
        />
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center z-10 px-4 -mt-20">
        <div className="text-center mb-12">
          <h1 className="text-7xl sm:text-8xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
            QuantumViz
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-300">
            Your ideas, transformed into quantum circuits
          </p>
        </div>
        
        <div className="w-full max-w-2xl flex items-center space-x-2 mt-8">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Describe your circuit here..."
              className="w-full bg-gray-800/60 border-gray-700 text-white pl-4 pr-10 py-3 rounded-l-full text-lg"
            />
            <Mic className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" size={24} />
          </div>
          <Button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-7 py-3 rounded-r-full flex items-center space-x-2 text-lg">
            <span>Generate</span>
            <Sparkles size={24} />
          </Button>
        </div>
      </main>
    </div>
  )
}
