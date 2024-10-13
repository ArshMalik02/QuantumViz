import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface QuantumCircuitProps {
  circuitEmbedUrl: string | null
}

export default function QuantumCircuit({ circuitEmbedUrl }: QuantumCircuitProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
  }, [circuitEmbedUrl])

  const handleRegenerate = () => {
    // TODO: Implement regeneration logic
    console.log("Regenerate circuit")
  }

  return (
    <Card className="w-full max-w-7xl mx-auto bg-gray-900 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Edit Your Quantum Circuit</CardTitle>
        <p className="text-gray-400">Now what you were imagining? Make edits to the circuit below.</p>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500">
              {error}
            </div>
          )}
          {circuitEmbedUrl ? (
            <iframe
              src={circuitEmbedUrl}
              title="Quantum Circuit Embedding"
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setError("Failed to load circuit embedding")
              }}
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No circuit embedding available
            </div>
          )}
        </div>
        <div className="flex justify-start">
          <Button 
            onClick={handleRegenerate} 
            variant="outline" 
            className="border-white bg-white/0.5"
          >
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
