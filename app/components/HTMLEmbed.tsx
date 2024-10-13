import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface HTMLEmbedProps {
  htmlContent: string
}

export function HTMLEmbed({ htmlContent }: HTMLEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(htmlContent)
        doc.close()
      }
    }
  }, [htmlContent])

  return (
    <Card className="bg-gray-900 h-full">
      <CardContent className="p-0">
        <iframe
          ref={iframeRef}
          className="w-full h-full min-h-[200px] border-none"
          title="Quantum Visualization"
          sandbox="allow-scripts"
        />
      </CardContent>
    </Card>
  )
}
