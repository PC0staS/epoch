import { useEffect, useState } from 'react'
import { captureUrl, listSnapshots } from '../api'
import { SnapshotSummary } from '../models'

export default function Home({
  listedSnapshots,
  setListedSnapshots,
}: {
  listedSnapshots: SnapshotSummary[]
  setListedSnapshots: (snapshots: SnapshotSummary[]) => void
}) {
  const [url, setUrl] = useState('')
  const [customPath, setCustomPath] = useState('')
  const [showCustomPathInput, setShowCustomPathInput] = useState(false)
  const last5Snapshots = listedSnapshots.slice(-5)

  const handleToggleCustomPathInput = () => {
    setShowCustomPathInput(!showCustomPathInput)
  }

  useEffect(() => {
    // Fetch the list of snapshots when the component mounts
    listSnapshots()
      .then(snapshots => setListedSnapshots(snapshots))
      .catch(err => console.error('Error fetching snapshots:', err))
  }, [])

  const handleCapture = () => {
    captureUrl(url, showCustomPathInput ? customPath : undefined)
      .then(id => {
        console.log(`Snapshot captured with ID: ${id}`)
        listSnapshots()
          .then(snapshots => setListedSnapshots(snapshots))
          .catch(err => console.error('Error fetching snapshots:', err))
      })
      .catch(err => {
        console.error('Error capturing snapshot:', err)
      })
  }
  return (
    <div>
      <h1>Home</h1>
      <div>
        <input
          type="text"
          placeholder="Enter URL"
          className="border p-2 rounded w-full"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleCapture}
        >
          Capture
        </button>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={handleToggleCustomPathInput}
      >
        Usar navegador personalizado?
      </button>
      {showCustomPathInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter custom path"
            className="border p-2 rounded w-full"
            value={customPath}
            onChange={e => setCustomPath(e.target.value)}
          />
        </div>
      )}
      {last5Snapshots.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Snapshots</h2>
          <ul>
            {last5Snapshots.map(snapshot => (
              <li key={snapshot.id} className="mb-2">
                <span className="font-medium">{snapshot.url}</span> -{' '}
                <span className="text-sm text-gray-500">{snapshot.captured_at}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
