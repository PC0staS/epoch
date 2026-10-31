import { deleteSnapshot } from '../api'
import { SnapshotSummary } from '../models'

export default function HistoryComponent({
  listedSnapshots,
  onSelectSnapshot,
}: {
  listedSnapshots: SnapshotSummary[]
  onSelectSnapshot?: (snapshot: number) => void
}) {
  return (
    <div className="animate-rise max-w-4xl">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
        {listedSnapshots.length} capturas
      </h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {listedSnapshots.map(snapshot => (
          <li key={snapshot.id} className="group flex items-baseline gap-4 py-3">
            <span className="w-10 shrink-0 font-mono text-[10px] tabular-nums text-ink-soft">
              #{snapshot.id}
            </span>
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                onSelectSnapshot?.(snapshot.id)
              }}
              className="min-w-0 flex-1"
            >
              <span className="block truncate font-display text-lg transition-colors group-hover:text-accent">
                {snapshot.title ?? snapshot.url}
              </span>
              <span className="block truncate font-mono text-[11px] text-ink-soft">
                {snapshot.url}
              </span>
            </a>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              {new Date(snapshot.captured_at).toLocaleDateString()}
            </span>
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                deleteSnapshot(snapshot.id)
              }}
              title="borrar"
              className="shrink-0 font-mono text-xs text-ink-soft opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
            >
              ✕
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
