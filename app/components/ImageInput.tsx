'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Sparkles } from 'lucide-react';

interface ImageInputWithButtonsProps {
    onGenerate: (image: File | null) => void;
    onMic: () => void;
}

export function ImageInputWithButtons({
    onGenerate,
    onMic
  }: ImageInputWithButtonsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // If a file is selected, generate a preview URL
        if (selectedImage) {
          const objectUrl = URL.createObjectURL(selectedImage);
          setPreviewUrl(objectUrl);
    
          // Clean up the object URL to avoid memory leaks
          return () => URL.revokeObjectURL(objectUrl);
        }
      }, [selectedImage]);
    
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          setSelectedImage(e.target.files[0]);
        }
      };
    
      const handleGenerate = async () => {
        setIsLoading(true);
        try {
          if (!selectedImage) {
            throw new Error('No image selected');
          }
    
          const formData = new FormData();
          formData.append('image', selectedImage);
    
          // Send the image file to your backend
          const response = await fetch('http://localhost:8080/process-image', {
            method: 'POST',
            body: formData
          });
    
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
    
          const data = await response.json();
          // Call the onGenerate prop with the response data
          await onGenerate(selectedImage);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false);
        }
      };
    
      return (
        <div ref={containerRef} className="relative w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="mb-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto rounded-md"
              />
            ) : (
              <p className="text-gray-500">No image selected.</p>
            )}
          </div>
    
          <div className="absolute right-2 bottom-2 flex items-center space-x-2 mb-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-transparent hover:bg-gray-700 text-gray-400 p-1 sm:p-2 rounded-full"
            >
              <span>Select Image</span>
            </Button>
            <Button
              onClick={onMic}
              className="bg-transparent hover:bg-gray-700 text-gray-400 p-1 sm:p-2 rounded-full"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !selectedImage}
              className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-md flex items-center space-x-1 text-xs sm:text-sm"
            >
              <span>{isLoading ? 'Generating...' : 'Generate'}</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      );
    }

    export default ImageInputWithButtons;