"use client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles } from "lucide-react";
import logo from "@/public/logo.png";
import leftNet from "@/public/left_net.png";
import rightNet from "@/public/right_net.png";
import leftLight from "@/public/left_light.png";
import rightLight from "@/public/right_light.png";
import QuantumCircuit from "@/app/components/QuantumCircuit";

import { ExpandableTextareaWithButtons } from "@/app/components/ExpandableTextareaWithButtons";

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
        <Image src={logo} alt="QuantumViz Logo" width={40} height={40} />
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center z-10 px-4 -mt-20">
        <div className="text-center mb-12">
          <h1 className="mb-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold">
            QuantumViz
          </h1>
          <p className="text-sm sm:text-lg md:text-2xl lg:text-3xl text-gray-300">
            Your ideas, transformed into quantum circuits
          </p>
        </div>
        <ExpandableTextareaWithButtons
          placeholder="Describe your circuit here..."
          onGenerate={() => {
            // Add your generate logic here
            console.log("Generate button clicked");
          }}
          onMic={() => {
            // Add your mic logic here
            console.log("Mic button clicked");
          }}
        />
        {/* <QuantumCircuit /> */}
      </main>
    </div>
  );
}
