import { useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, getDay, parse, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { deleteSnapshot } from '../api'
import { SnapshotSummary } from '../models'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es }),
  getDay,
  locales: { es },
})

export default function HistoryComponent({
  listedSnapshots,
  onSelectSnapshot,
}: {
  listedSnapshots: SnapshotSummary[]
  onSelectSnapshot?: (snapshot: number) => void
}) {
  const [mode, setMode] = useState<'table' | 'calendar'>('table')
  const [date, setDate] = useState(new Date())
  const [filter, setFilter] = useState('')
  const filteredSnapshots = listedSnapshots.filter(
    snapshot =>
      snapshot.title?.toLowerCase().includes(filter.toLowerCase()) ||
      snapshot.url.toLowerCase().includes(filter.toLowerCase()) ||
      snapshot.captured_at.includes(filter),
  )

  const events = filteredSnapshots.map(snapshot => ({
    id: snapshot.id,
    title: snapshot.title ?? snapshot.url,
    start: new Date(snapshot.captured_at),
    end: new Date(snapshot.captured_at),
  }))

  return (
    <div className="animate-rise">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
          {filteredSnapshots.length} snapshots
        </h2>
        <input
          placeholder="Search..."
          className="bg-transparent border-b border-line py-1 text-sm focus:outline-none focus:border-accent"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <div className="flex gap-4 font-mono text-[10px] uppercase tracking-[0.2em]">
          {(['table', 'calendar'] as const).map(option => (
            <button
              key={option}
              onClick={() => setMode(option)}
              className={
                mode === option
                  ? 'text-accent underline underline-offset-4'
                  : 'text-ink-soft hover:text-ink'
              }
            >
              {option === 'table' ? 'list' : 'calendar'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'calendar' ? (
        <div className="epoch-calendar mt-4 h-[70vh] border border-line">
          <Calendar
            localizer={localizer}
            culture="es"
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={date}
            defaultView="month"
            onNavigate={newDate => setDate(newDate)}
            views={['month']}
            popup
            onSelectEvent={event => onSelectSnapshot?.(event.id)}
          />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {filteredSnapshots.map(snapshot => (
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
                title="delete"
                className="shrink-0 font-mono text-xs text-ink-soft opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
              >
                ✕
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
