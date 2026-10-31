import { useEffect, useState } from 'react'
import { getSnapshot } from '../api'
import { Snapshot } from '../models'

export default function SnapshotComponent({ snapshotId }: { snapshotId: number }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [trusted, setTrusted] = useState(false)
  useEffect(() => {
    getSnapshot(snapshotId)
      .then(snapshot => {
        if (!snapshot) {
          console.error(`Snapshot with ID ${snapshotId} not found.`)
          return
        }
        setSnapshot(snapshot)
      })
      .catch(err => {
        console.error(`Error fetching snapshot with ID ${snapshotId}:`, err)
      })
  }, [snapshotId])

  useEffect(() => {
    setTrusted(false)
  }, [snapshotId])
  return (
    <div className="w-full h-full pb-10">
      <h1>Snapshot</h1>
      {snapshot && (
        <div>
          <p>{snapshot.title}</p>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm my-2">
        <input type="checkbox" checked={trusted} onChange={e => setTrusted(e.target.checked)} />
        Ejecutar scripts con acceso al origen (solo si la web es de confianza)
      </label>
      <iframe
        key={trusted ? 'trusted' : 'sandboxed'}
        srcDoc={snapshot?.html_content}
        width="100%"
        height="100%"
        sandbox={trusted ? 'allow-scripts allow-same-origin' : 'allow-scripts'}
      />
    </div>
  )
}
