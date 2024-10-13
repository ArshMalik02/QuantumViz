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

interface Message {
  text: string;
  isUser: boolean;
}

export function QuirkyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit">Send</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
