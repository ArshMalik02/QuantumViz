import CodeSnippet from './CodeSnippet'
import { HTMLEmbed } from './HTMLEmbed'

interface QuantumVisualizationProps {
  code: string
  htmlFile1: string
  htmlFile2: string
}

export default function QuantumVisualization({ code, htmlFiles }: QuantumVisualizationProps) {
    console.log(htmlFiles);
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-950 text-white min-h-screen">
      <div className="w-full md:w-1/2">
        <CodeSnippet code={code} />
      </div>
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <HTMLEmbed htmlFile={htmlFiles[0]} />
        <HTMLEmbed htmlFile={htmlFiles[1]} />
      </div>
    </div>
  )
}
