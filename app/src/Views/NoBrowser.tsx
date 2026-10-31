export default function NoBrowser({ message, onCheck }: { message: string; onCheck: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-red-600">No browser found: {message}</p>
      <button
        onClick={onCheck}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Check Again
      </button>
    </div>
  )
}
