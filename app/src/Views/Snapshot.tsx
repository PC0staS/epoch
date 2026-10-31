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
    <div className="animate-rise flex h-full flex-col">
      <div className="flex items-baseline justify-between gap-6 border-b border-line pb-4">
        <div className="min-w-0">
          <h2 className="truncate font-display text-2xl leading-tight">
            {snapshot?.title ?? 'Snapshot'}
          </h2>
          <p className="mt-1 truncate font-mono text-[11px] text-ink-soft">{snapshot?.url}</p>
        </div>
        {snapshot && (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            {new Date(snapshot.captured_at).toLocaleDateString()}
          </span>
        )}
      </div>

      <label className="flex items-center gap-2 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
        <input
          type="checkbox"
          checked={trusted}
          onChange={e => setTrusted(e.target.checked)}
          className="accent-accent"
        />
        ejecutar scripts con acceso al origen
      </label>

      <div className="min-h-[60vh] flex-1 border border-line bg-white">
        {snapshot && (
          <iframe
            key={trusted ? 'trusted' : 'sandboxed'}
            srcDoc={snapshot?.html_content}
            className="h-full min-h-[60vh] w-full"
            sandbox={trusted ? 'allow-scripts allow-same-origin' : 'allow-scripts'}
          />
        )}
      </div>
    </div>
  )
}
