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
    <div>
      <h1>History</h1>
      <ul>
        {listedSnapshots.map(snapshot => (
          <li key={snapshot.id}>
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                onSelectSnapshot?.(snapshot.id)
              }}
            >
              {snapshot.title}
            </a>
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                deleteSnapshot(snapshot.id)
              }}
            >
              borrar
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
