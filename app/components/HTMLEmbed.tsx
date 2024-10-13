import { Card, CardContent } from "@/components/ui/card"

interface HTMLEmbedProps {
  htmlFile: string
}

export function HTMLEmbed({ htmlFile }: HTMLEmbedProps) {
  return (
    <Card className="bg-gray-900 h-full">
      <CardContent className="p-0">
        <iframe
          src={htmlFile}
          className="w-full h-full min-h-[200px] border-none"
          title="Quantum Visualization"
        />
      </CardContent>
    </Card>
  )
}
