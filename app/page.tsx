"use client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles } from "lucide-react";
import run_logo from "@/public/run_logo.gif";
import leftNet from "@/public/left_net.png";
import rightNet from "@/public/right_net.png";
import leftLight from "@/public/left_light.png";
import rightLight from "@/public/right_light.png";
import { useEffect, useRef, useState } from "react";
import QuantumCircuit from "@/components/QuantumCircuit";
import CodeSnippet from "@/components/CodeSnippet";

import { ExpandableTextareaWithButtons } from "@/components/ExpandableTextareaWithButtons";
import QuantumVisualization from "@/components/QuantumVisualization";
import { QuirkyChat } from "@/components/QuirkyChat";
import micIcon from '@/public/mic.png';

export default function Home() {
  const [apiResponse, setApiResponse] = useState<JSON | null>(null);
  const [codeApiResponse, setCodeApiResponse] = useState<JSON | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [htmlContent, setHtmlContent] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= 15) {
            stopRecording();
            return 15;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
  const handleGenerate = async (input: string) => {
    try {
      const response = await fetch('http://localhost:8080/process-prompt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: input }),
      });
      console.log('getting code');
      const codeResponse = await fetch('http://localhost:8080/get_qiskit_code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: input }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);
      console.log('setting api response');
      setApiResponse(data);
      const codeData = await codeResponse.json();
      console.log(codeData);
      setCodeApiResponse(codeData);

      // Parse the HTML content from the response
      if (codeData.html_files) {
        const parsedHtmlContent: { [key: string]: string } = {};
        for (const [filename, content] of Object.entries(codeData.html_files)) {
          parsedHtmlContent[filename] = content as string;
        }
        setHtmlContent(parsedHtmlContent);
      }
    } catch (error) {
      console.error('Error:', error);
      setApiResponse('An error occurred while processing your request.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      let audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      const base64Data = base64Audio.split(',')[1];

      console.log('Base64 audio data length:', base64Data.length);

      try {
        const response = await fetch('http://localhost:8080/transcribe-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audio_data: base64Data }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. ${errorText}`);
        }

        const data = await response.json();
        console.log('Transcription response:', data);
        setTranscription(data.transcription);
      } catch (error: unknown) {
        console.error('Error transcribing audio:', error);
        setTranscription(`An error occurred while transcribing the audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    setIsTranscribing(false);
  };

  // Call transcribeAudio after stopping the recording
  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
      transcribeAudio(new Blob(audioChunks, { type: 'audio/wav' }));
    }
  }, [isRecording, audioChunks]);

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
          src={run_logo}
          alt="QuantumViz Logo"
          width={40}
          height={40}
        />
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center z-10 px-4 -mt-20">
        <div className="text-center mb-12">
          <h1 className="mb-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
            QuantumViz
          </h1>
          <p className="text-2xl text-gray-300">
            Your ideas, transformed into quantum circuits
          </p>
        </div>
        {isRecording ? (
          <div className="w-full max-w-2xl">
            {/* <canvas ref={canvasRef} className="w-full h-24 bg-gray-800 rounded-lg mb-4" /> */}
            <div className="flex justify-between items-center">
              <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(recordingTime / 15) * 100}%` }}
                />
              </div>
              <p className="ml-4 text-lg">{recordingTime}s / 15s</p>
            </div>
            <Button onClick={stopRecording} variant="destructive" className="mt-4 w-full">
              Stop Recording
            </Button>
          </div>
        ) : (
          <ExpandableTextareaWithButtons
            placeholder="Describe your circuit here..."
            onGenerate={handleGenerate}
            onMic={startRecording}
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            isTranscribing={isTranscribing}
            micIcon={
              <Image
                src={micIcon}
                alt="Microphone"
                width={20}
                height={20}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
            }
          />
        )}
      </main>

      {/* Quirky Chat */}
      <QuirkyChat />

      {apiResponse && (
        <section id="quantum-circuit" className="w-full py-16 z-10">
          <div className="container mx-auto">
            <QuantumCircuit circuitEmbedUrl={apiResponse} />
          </div>
        </section>
      )}
      {/* {codeApiResponse && (
        <CodeSnippet code={codeApiResponse.code} />
      )} */}
      {codeApiResponse && (
        <section className="w-full py-16 z-10 bg-black">
          <div className="container mx-auto px-4">
            <QuantumVisualization 
              code={codeApiResponse.code} 
              htmlContent={htmlContent}
            />
          </div>
        </section>
      )}
    </div>
  )
}
