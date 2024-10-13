export default function QuantumCircuit() {
    const updatedCircuit = encodeURIComponent(JSON.stringify({
      "cols": [
        ["H", 1],
        ["•", "Z"],
        [1, "X^½"]
      ]
    }));
  
    return (
      <div className="relative h-[calc(100vh-24rem)] w-full rounded-lg overflow-hidden">
        <iframe
          src={`https://algassert.com/quirk#circuit=${updatedCircuit}`}
          className="absolute inset-0 h-full w-full border-0"
          title="Quantum Circuit Visualizer"
          allowFullScreen
        />
      </div>
    );
  }