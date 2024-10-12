'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';
import ReactMarkdown from 'react-markdown';
import Editor from 'react-simple-code-editor';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { Button } from '@/components/ui/button';

interface QuantumContentProps {
  initialPythonCode: string;
  initialMarkdownContent: string;
}

export default function QuantumContent({ initialPythonCode, initialMarkdownContent }: QuantumContentProps) {
  const [pythonCode, setPythonCode] = useState(initialPythonCode);
  const [markdownContent, setMarkdownContent] = useState(initialMarkdownContent);
  const [showPreview, setShowPreview] = useState(false);

  const handleEditorChange = (code: string) => {
    setPythonCode(code);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
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
    </>
  );
}
