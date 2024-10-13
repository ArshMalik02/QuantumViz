'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Sparkles } from 'lucide-react';

interface ExpandableTextareaWithButtonsProps {
  placeholder: string;
  onGenerate: (input: string | File) => void;  // Allow both string (text) and File (image)
  onMic: () => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ExpandableTextareaWithButtons({
  placeholder,
  onGenerate,
  onMic,
  value,
  onChange
}: ExpandableTextareaWithButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current && containerRef.current) {
      const buttonHeight = 40; // Approximate height of the button
      const padding = 16; // 8px top and bottom padding
      const minHeight = buttonHeight + padding;
      
      containerRef.current.style.minHeight = `${minHeight}px`;
      textareaRef.current.style.height = `${minHeight}px`;
      
      if (textareaRef.current.scrollHeight > minHeight) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      if (selectedImage) {
        // Process image file
        const formData = new FormData();
        formData.append('image', selectedImage);

        const response = await fetch('http://localhost:8080/upload-image', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setApiResponse(data);
        await onGenerate(selectedImage);
      } else if (value.trim()) {
        // Process text input
        const response = await fetch('http://localhost:8080/process-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_input: value }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setApiResponse(data);
        await onGenerate(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setApiResponse('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full placeholder-vertical-center bg-gray-800/60 border-gray-700 text-white pl-4 pr-24 sm:pr-28 py-2 rounded-md text-sm sm:text-base md:text-lg placeholder-white overflow-hidden resize-none"
      />
      <div className="absolute right-2 bottom-2 flex items-center space-x-2 mb-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-transparent hover:bg-gray-700 text-gray-400 p-1 sm:p-2 rounded-full"
        >
          <span>Select Image</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={onMic}
          className="bg-transparent hover:bg-gray-700 text-gray-400 p-1 sm:p-2 rounded-full"
        >
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isLoading || (!value && !selectedImage)}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-md flex items-center space-x-1 text-xs sm:text-sm"
        >
          <span>{isLoading ? 'Generating...' : 'Generate'}</span>
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}

export default ExpandableTextareaWithButtons;
