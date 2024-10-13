'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Sparkles } from 'lucide-react';

interface ExpandableTextareaWithButtonsProps {
  placeholder: string;
  onGenerate: () => void;
  onMic: () => void;
}

export function ExpandableTextareaWithButtons({
  placeholder,
  onGenerate,
  onMic
}: ExpandableTextareaWithButtonsProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full placeholder-vertical-center bg-gray-800/60 border-gray-700 text-white pl-4 pr-24 sm:pr-28 py-2 rounded-md text-sm sm:text-base md:text-lg placeholder-white overflow-hidden resize-none"
      />
      <div className="absolute right-2 bottom-2 flex items-center space-x-2 mb-2">
        <Button
          onClick={onMic}
          className="bg-transparent hover:bg-gray-700 text-gray-400 p-1 sm:p-2 rounded-full"
        >
          {/* <Mic className="text-gray-400 sm:size-" size={16}  /> */}
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          onClick={onGenerate}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-md flex items-center space-x-1 text-xs sm:text-sm"
        >
          <span>Generate</span>
          <Sparkles size={14} />
        </Button>
      </div>
    </div>
  );
}
