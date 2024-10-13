import { Suspense } from 'react';
import { Atom, Sparkles } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import ReactMarkdown from 'react-markdown';
import Editor from 'react-simple-code-editor';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import { Button } from '@/components/ui/button';
import { Section } from '@/components/section';
import { useState } from 'react';

interface QuantumPageProps {
  tagline: string;
}

export default function QuantumPage({ tagline }: QuantumPageProps) {
  const initialPythonCode = 'def quantum_function():\n    # Your quantum code here\n    pass';
  const initialMarkdownContent = 'Enter your Markdown and LaTeX here\n\n$E = mc^2$';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <Section className="py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-center">
            <Atom className="mr-4 size-16" />
            <h1 className="mb-2 font-serif text-6xl font-extrabold">Quantum Viz</h1>
            <Sparkles className="ml-4 size-16" />
          </div>
          <p className="mb-12 text-center text-2xl font-light">{tagline}</p>

          <h2 className="mb-6 font-serif text-3xl font-bold">Quantum Circuit Visualizer</h2>
          <div className="mb-12 relative h-[calc(100vh-24rem)] w-full rounded-lg overflow-hidden">
            <iframe
              src="https://algassert.com/quirk#circuit=%7B%22cols%22%3A%20%5B%5B%22H%22%2C%201%5D%2C%20%5B%22%E2%80%A2%22%2C%20%22X%22%5D%5D%7D"
              className="absolute inset-0 h-full w-full border-0"
              title="Quantum Circuit Visualizer"
              allowFullScreen
            />
          </div>

          <Suspense fallback={<div>Loading interactive content...</div>}>
            <DynamicQuantumContent
              initialPythonCode={initialPythonCode}
              initialMarkdownContent={initialMarkdownContent}
            />
          </Suspense>
        </div>
      </Section>
    </div>
  );
}