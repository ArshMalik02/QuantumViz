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
import { useState } from "react";
import QuantumCircuit from "@/app/components/QuantumCircuit";


import { ExpandableTextareaWithButtons } from "@/app/components/ExpandableTextareaWithButtons";

export default function Home() {
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const handleGenerate = async (input: string) => {
    try {
      const response = await fetch('http://localhost:8080/process-prompt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_prompt: input }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);
      setApiResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setApiResponse('An error occurred while processing your request.');
    }
  };

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
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300">
            Your ideas, transformed into quantum circuits
          </p>
        </div>
        <ExpandableTextareaWithButtons
          placeholder="Describe your circuit here..."
          onGenerate={handleGenerate}
          onMic={() => {
            console.log("Mic button clicked");
          }}
        />
      </main>

      {apiResponse && (
        <section id="quantum-circuit" className="w-full py-16 z-10">
          <div className="container mx-auto">
            <QuantumCircuit circuitEmbedUrl={apiResponse} />
          </div>
        </section>
      )}
    </div>
  );
}