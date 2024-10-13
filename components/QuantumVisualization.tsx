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
    <div className="flex flex-col lg:flex-row gap-2 p-4 text-white ml-4 mr-4 sm:ml-10 sm:mr-6 md:ml-20 md:mr-8 lg:ml-20 lg:mr-12">
      <div className="w-full lg:w-3/5 lg:h-[calc(100vh-2rem)] flex items-start">
        <div className="w-full h-full lg:h-auto overflow-auto">
          <CodeSnippet code={code} />
        </div>
      </div>
      <div className="w-full lg:w-2/5 flex flex-col gap-4">
        <div className="h-[300px] lg:h-1/2">
          <HTMLEmbed htmlContent={'http://localhost:8080/plots/qubit_0_bloch_sphere.html'} />
        </div>
        <div className="h-[300px] lg:h-1/2">
          <HTMLEmbed htmlContent={'http://localhost:8080/plots/qubit_1_bloch_sphere.html'} />
        </div>
      </div>
    </div>
  )
}
