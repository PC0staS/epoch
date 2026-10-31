export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      <div className="h-10 w-10 animate-spin rounded-full border border-line border-t-accent" />
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">
        opening the archive
      </p>
    </div>
  )
}
