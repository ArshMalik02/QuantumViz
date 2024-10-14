'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { LoadingDots } from './LoadingDots';
import { Mic, X, StopCircle } from "lucide-react";

interface Message {
  text: string;
  isUser: boolean;
}

export function QuirkyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const transcribeAudio = async () => {
    if (audioChunks.length === 0) {
      console.error('No audio data available');
      return;
    }

    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    console.log('Audio blob size:', audioBlob.size);

    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(audioBlob);
    });

    const base64Data = base64Audio.split(',')[1];

    console.log('Base64 audio data length:', base64Data.length);

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
    const transcribedText = data.transcription;
    setInputMessage(transcribedText);
    setAudioChunks([]);

    // Automatically send the transcribed message
    await handleSendMessage(transcribedText);
  };

  const handleSendMessage = async (message?: string) => {
    const textToSend = message || inputMessage;
    if (textToSend.trim() === '') return;

    const newUserMessage: Message = { text: textToSend, isUser: true };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const newBotMessage: Message = { text: data.response, isUser: false };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = { text: 'Sorry, I encountered an error.', isUser: false };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
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
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
      setInputMessage('Transcribing audio... Please wait.');
      
      try {
        await transcribeAudio();
      } catch (error) {
        console.error('Error during transcription:', error);
        setInputMessage('An error occurred while transcribing the audio.');
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
      // We don't need to do anything here now, as transcription is handled in stopRecording
    }
  }, [isRecording, audioChunks]);

  return (
    <div className={cn(
      'fixed z-50 transition-all duration-300 ease-in-out',
      isOpen 
        ? 'w-[29.12%] h-[54.6vh] bottom-8 right-8' 
        : 'w-20 h-20 bottom-8 right-8'
    )}>
      {!isOpen ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-spin-slow">
                <Button
                  onClick={handleToggleChat}
                  className="w-full h-full rounded-full p-0 hover:scale-110 transition-all duration-300 ease-in-out"
                >
                  <Image
                    src="/quirky.png"
                    alt="Quirky"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Ask Your Questions</h2>
            <Button onClick={handleToggleChat} variant="ghost" size="sm">
              Close
            </Button>
          </div>
          {isRecording ? (
            <div className="flex-grow flex flex-col items-center justify-between bg-gradient-to-tr from-[#E99C5D] to-[#F4C8A4] p-4 w-full h-full">
              <div className="flex-grow flex flex-col items-center justify-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-pink-300 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping opacity-75 animation-delay-300"></div>
                  <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-75 animation-delay-600"></div>
                  <div className="relative bg-pink-600 rounded-full p-8">
                    <Mic className="h-16 w-16 text-white" />
                  </div>
                </div>
                <p className="text-black font-medium text-xl">Speech-to-Speech</p>
              </div>
              <div className="w-full flex justify-between">
                <Button
                  size="lg"
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-black rounded-full p-3"
                  onClick={stopRecording}
                >
                  <Mic className="h-6 w-6" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-black rounded-full p-3"
                  onClick={() => setIsRecording(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={cn(
                    'flex items-start space-x-2',
                    message.isUser ? 'justify-end' : 'justify-start'
                  )}>
                    {!message.isUser && (
                      <Image
                        src="/quirky.png"
                        alt="Quirky"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <div className={cn(
                      'max-w-[80%] p-2 rounded-lg overflow-auto',
                      message.isUser 
                        ? 'bg-gradient-to-r from-[#E2487E] to-[#F27758] text-white' 
                        : 'bg-gray-700 text-gray-200'
                    )}>
                      {message.isUser ? (
                        message.text
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-2 mb-1" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-2 mb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-medium mt-2 mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            code: ({inline, ...props}: {inline?: boolean} & React.ComponentPropsWithoutRef<'code'>) => 
                              inline ? (
                                <code className="bg-gray-800 rounded px-1" {...props} />
                              ) : (
                                <code className="block bg-gray-800 rounded p-2 my-2 whitespace-pre-wrap" {...props} />
                              ),
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      )}
                    </div>
                    {message.isUser && (
                      <UserCircleIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-2">
                    <Image
                      src="/quirky.png"
                      alt="Quirky"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="bg-gray-700 p-2 rounded-lg">
                      <LoadingDots />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-700">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-grow"
                    disabled={isTranscribing || isLoading}
                  />
                  <Button type="submit" disabled={isTranscribing || isLoading}>Send</Button>
                  <Button type="button" onClick={startRecording} disabled={isTranscribing || isLoading}>
                    <Mic className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
