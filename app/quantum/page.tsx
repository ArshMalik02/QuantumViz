'use client';

import 'katex/dist/katex.min.css';

import { motion } from 'framer-motion';
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

const QuantumPage: React.FC<QuantumPageProps> = ({ tagline }) => {
  const [pythonCode, setPythonCode] = useState('def quantum_function():\n    # Your quantum code here\n    pass');
  const [markdownContent, setMarkdownContent] = useState('Enter your Markdown and LaTeX here\n\n$E = mc^2$');
  const [showPreview, setShowPreview] = useState(false);

  const handleEditorChange = (code: string) => {
    setPythonCode(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <Section className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-8 flex items-center justify-center">
            <Atom className="mr-4 size-16" />
            <h1 className="mb-2 font-serif text-6xl font-extrabold">Quantum Viz</h1>
            <Sparkles className="ml-4 size-16" />
          </div>
          <p className="mb-12 text-center text-2xl font-light">{tagline}</p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="mb-6 font-serif text-3xl font-bold">Quantum Circuit Visualizer</h2>
            <div className="mb-12 relative h-[calc(100vh-24rem)] w-full rounded-lg overflow-hidden">
              <iframe
                src="https://algassert.com/quirk#circuit=%7B%22cols%22%3A%20%5B%5B%22H%22%2C%201%5D%2C%20%5B%22%E2%80%A2%22%2C%20%22X%22%5D%5D%7D"
                className="absolute inset-0 h-full w-full border-0"
                title="Quantum Circuit Visualizer"
                allowFullScreen
              />
            </div>

            <h2 className="mb-6 font-serif text-3xl font-bold">Python Code Block</h2>
            <div className="mb-12 overflow-hidden rounded-lg border border-white/20 bg-black/30 backdrop-blur-sm">
              <Editor
                value={pythonCode}
                onValueChange={handleEditorChange}
                highlight={code => (
                  <Highlight theme={themes.nightOwl} code={code} language="python">
                    {({ tokens, getLineProps, getTokenProps }) => (
                      <>
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line })}>
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token })} />
                            ))}
                          </div>
                        ))}
                      </>
                    )}
                  </Highlight>
                )}
                padding={20}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 16,
                  backgroundColor: 'transparent',
                  color: themes.nightOwl.plain.color,
                }}
                className="min-h-[200px]"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="mb-6 font-serif text-3xl font-bold">Markdown and LaTeX Block</h2>
            <div className="mb-4 flex justify-end">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-white text-purple-700 hover:bg-purple-100"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            {showPreview
              ? (
                  <div className="mb-12 rounded-lg border border-white/20 bg-black/30 p-6 backdrop-blur-sm">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                )
              : (
                  <textarea
                    value={markdownContent}
                    onChange={e => setMarkdownContent(e.target.value)}
                    className="mb-12 h-48 w-full rounded-lg border border-white/20 bg-black/30 p-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your Markdown and LaTeX here"
                  />
                )}
          </motion.div>
        </motion.div>
      </Section>
    </div>
  );
};

export default QuantumPage;
