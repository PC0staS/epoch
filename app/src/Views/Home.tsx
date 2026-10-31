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
      <section className="animate-rise">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
          nueva captura
        </h2>
        <div className="mt-4 flex items-end gap-4">
          <input
            type="text"
            placeholder="https://ejemplo.com"
            className="min-w-0 flex-1 border-b border-line bg-transparent py-3 font-mono text-lg outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <button
            className="shrink-0 bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
            onClick={handleCapture}
          >
            Guardar
          </button>
        </div>
        <button
          className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-accent"
          onClick={handleToggleCustomPathInput}
        >
          {showCustomPathInput ? 'usar el detectado' : 'usar otro navegador'}
        </button>
        {showCustomPathInput && (
          <input
            type="text"
            placeholder="/usr/bin/chromium"
            className="mt-3 w-full border-b border-line bg-transparent py-2 font-mono text-sm outline-none transition-colors placeholder:text-ink-soft/50 focus:border-accent"
            value={customPath}
            onChange={e => setCustomPath(e.target.value)}
          />
        )}
      </section>

      {last5Snapshots.length > 0 && (
        <section className="animate-rise mt-16" style={{ animationDelay: '120ms' }}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
            últimas capturas
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {last5Snapshots.map(snapshot => (
              <li key={snapshot.id} className="flex items-baseline gap-4 py-3">
                <span className="w-10 shrink-0 font-mono text-[10px] tabular-nums text-ink-soft">
                  #{snapshot.id}
                </span>
                <span className="min-w-0 flex-1 truncate font-display text-lg">
                  {snapshot.title ?? snapshot.url}
                </span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  {new Date(snapshot.captured_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
