'use client';

import { useState, useEffect } from 'react';

export function LoadingDots() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => (prevDots.length >= 3 ? '' : prevDots + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-1 h-6">
      {[0, 1, 2].map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 bg-gray-400 rounded-full ${
            index < dots.length ? 'animate-bounce' : ''
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        ></div>
      ))}
    </div>
  );
}
