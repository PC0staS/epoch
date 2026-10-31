import { openUrl } from '@tauri-apps/plugin-opener'

const PANELS = [
  { name: 'home', label: 'Home' },
  { name: 'history', label: 'History' },
  { name: 'snapshot', label: 'Snapshot' },
] as const

type PanelName = (typeof PANELS)[number]['name']

export default function Layout({
  panel,
  onNavigate,
  children,
  sideBarUpdateNotice,
}: {
  panel: PanelName
  onNavigate: (panel: { name: PanelName }) => void
  children: React.ReactNode
  sideBarUpdateNotice?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-line">
        <div className="flex items-center justify-between px-8 py-5">
          <h1 className="font-display text-3xl tracking-tight">Epoch</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
            personal web archive
          </p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-52 shrink-0 flex-col border-r border-line px-6 py-8">
          <nav className="flex flex-col">
            {PANELS.map((item, i) => (
              <button
                key={item.name}
                onClick={() => onNavigate({ name: item.name })}
                className={
                  'flex items-baseline gap-3 py-2 text-left font-mono text-sm transition-colors ' +
                  (panel === item.name ? 'text-accent' : 'text-ink-soft hover:text-ink')
                }
              >
                <span className="text-[10px] tabular-nums opacity-50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={panel === item.name ? 'underline underline-offset-4' : ''}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
          {sideBarUpdateNotice && <div className="mt-auto">{sideBarUpdateNotice}</div>}
        </aside>
        <main className="min-h-0 flex-1 overflow-auto px-10 py-8">{children}</main>
      </div>
      <footer className="flex items-baseline justify-between border-t border-line px-8 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
          Epoch · {new Date().getFullYear()}
        </p>
        <button
          onClick={() => openUrl('https://github.com/PC0staS')}
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft transition-colors hover:text-accent"
        >
          github.com/PC0staS
        </button>
      </footer>
    </div>
  )
}
