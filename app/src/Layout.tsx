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
}: {
  panel: PanelName
  onNavigate: (panel: { name: PanelName }) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">Epoch</h1>
      </header>
      <div className="flex flex-1">
        <aside className="w-56 shrink-0 bg-gray-100 border-r border-gray-300 p-4">
          <nav className="flex flex-col gap-1">
            {PANELS.map(item => (
              <button
                key={item.name}
                onClick={() => onNavigate({ name: item.name })}
                className={
                  'text-left px-3 py-2 rounded hover:bg-gray-200 ' +
                  (panel === item.name ? 'bg-gray-200 font-semibold' : '')
                }
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
      <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; {new Date().getFullYear()} Epoch
      </footer>
    </div>
  )
}
