export default function NoBrowser({ message, onCheck }: { message: string; onCheck: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center px-6">
      <div className="animate-rise w-full max-w-lg border border-line bg-paper-deep p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          sin navegador
        </p>
        <h2 className="mt-4 font-display text-2xl leading-snug">
          Epoch necesita un navegador Chromium para capturar páginas.
        </h2>
        <p className="mt-4 font-mono text-xs leading-relaxed text-ink-soft">{message}</p>
        <button
          onClick={onCheck}
          className="mt-8 bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
