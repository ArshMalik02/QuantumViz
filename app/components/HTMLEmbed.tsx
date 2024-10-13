// import { Card, CardContent } from "@/components/ui/card"

// interface HTMLEmbedProps {
//   htmlContent: string // This will now be a URL
// }

// export function HTMLEmbed({ htmlContent }: HTMLEmbedProps) {
//   return (
//     <Card className="bg-gray-900 h-full">
//       <CardContent className="p-0">
//         <iframe
//           src={htmlContent}
//           className="w-full h-full min-h-[200px] border-none"
//           title="Quantum Visualization"
//           sandbox="allow-scripts allow-same-origin"
//           loading="lazy"
//         />
//       </CardContent>
//     </Card>
//   )
// }

import { Card, CardContent } from "@/components/ui/card"

interface HTMLEmbedProps {
  htmlContent: string // This is a URL like http://localhost:8080/plots/qubit_0_bloch_sphere.html
}

export function HTMLEmbed({ htmlContent }: HTMLEmbedProps) {
  return (
    <Card className="bg-gray-900 h-full min-h-[500px] mr-24">
      <CardContent className="p-0">
        <iframe
          src={htmlContent}
          className="w-full h-[600px] border-none"
          title="Quantum Visualization"
          // sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          // referrerPolicy="no-referrer"
        />
      </CardContent>
    </Card>
  )
}
