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
import CodeSnippet from "@/app/components/CodeSnippet";

import { ExpandableTextareaWithButtons } from "@/app/components/ExpandableTextareaWithButtons";
import QuantumVisualization from "./components/QuantumVisualization";
import { QuirkyChat } from "@/app/components/QuirkyChat";

export default function Home() {
  const [apiResponse, setApiResponse] = useState<JSON | null>(null);
  const [codeApiResponse, setCodeApiResponse] = useState<JSON | null>(null);
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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(chunks => [...chunks, event.data]);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      visualizeAudio(stream);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const visualizeAudio = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
      canvasCtx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  };

  const transcribeAudio = async () => {
    if (audioChunks.length === 0) {
      console.error('No audio data available');
      return;
    }

    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    console.log('Audio blob size:', audioBlob.size);

    // Add this: Create an audio element and play the recorded audio
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();

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
  };

  // Call transcribeAudio after stopping the recording
  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
      transcribeAudio();
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
          src={logo}
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
        
        <div className="w-full max-w-2xl flex items-center space-x-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Describe your circuit here..."
              className="w-full bg-gray-800/60 border-gray-700 text-white pl-4 pr-10 py-3 rounded-l-full"
            />
            <Mic className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" size={20} />
          </div>
        </section>
      )}
      {codeApiResponse && (
        <CodeSnippet code={codeApiResponse.code} />
      )}
      {codeApiResponse && (
        <QuantumVisualization code={codeApiResponse.code} htmlFiles={codeApiResponse.html_files} />
      )}
    </div>
  )
}
