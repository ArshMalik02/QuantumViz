import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeSnippetProps {
  code: string;
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
      {message}
    </div>
  );
}

export default function CodeSnippet({ code }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(() => {
    const copyToClipboard = async (text: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          // Use the Clipboard API if available
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement("textarea");
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand("copy");
            setCopied(true);
          } catch (err) {
            console.error("Unable to copy to clipboard", err);
          }
          document.body.removeChild(textArea);
        }
      } catch (error) {
        console.error('Failed to copy:', error);
      }

      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    };

    copyToClipboard(code);
  }, [code]);

  return (
    <>
      <Card className="bg-gray-900 text-white w-full max-w-2xl mx-auto mr-24">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">python</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className="text-xs text-gray-400 hover:text-white"
          >
            {copied ? "Copied!" : "Copy Code"}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[1156px] w-full rounded-md">
            <SyntaxHighlighter
              language="python"
              style={theme}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
              }}
            >
              {code}
            </SyntaxHighlighter>
          </ScrollArea>
        </CardContent>
      </Card>
      {copied && <Toast message="Code copied to clipboard!" />}
    </>
  );
}
