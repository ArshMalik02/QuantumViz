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
  const [recordingTime, setRecordingTime] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage: Message = { text: inputMessage, isUser: true };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inputMessage }),
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

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prevTime => {
          if (prevTime >= 15) {
            stopRecording();
            return 15;
          }
          return prevTime + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const transcribeAudio = async () => {
    if (audioChunks.length === 0) return;

    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      const base64Data = base64Audio.split(',')[1];

      try {
        const response = await fetch('http://localhost:8080/chatbot-transcribe-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio_file: base64Data }),
        });

        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

        const data = await response.json();
        setInputMessage(data.transcription);
      } catch (error) {
        console.error('Error transcribing audio:', error);
      }
    };
  };

  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
      transcribeAudio();
      setAudioChunks([]);
      setRecordingTime(0);
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
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Ask Your Questions</h2>
            <Button onClick={handleToggleChat} variant="ghost" size="sm">
              Close
            </Button>
          </div>
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
                  message.isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
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
            {isRecording ? (
              <div className="flex flex-col items-center space-y-4 p-4 bg-orange-100 rounded-lg">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-300 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-pink-500 rounded-full p-4">
                    <Mic className="h-8 w-8 text-white" />
                  </div>
                </div>
                <p className="text-black font-medium">Speech-to-Speech</p>
                <p className="text-black">{recordingTime} / 15 seconds</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="bg-white/20" onClick={stopRecording}>
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                  <Button size="sm" variant="ghost" className="bg-white/20" onClick={() => setIsRecording(false)}>
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit">Send</Button>
                <Button type="button" onClick={startRecording}>
                  <Mic className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}