import { useState } from 'react'
import type { Update } from '@tauri-apps/plugin-updater'
import { relaunch } from './api'
import { openUrl } from '@tauri-apps/plugin-opener'

const RELEASES = 'https://github.com/PC0staS/epoch/releases/latest'

export default function UpdateNotice({
  update,
  canSelf,
}: {
  update: Update | null
  canSelf: boolean
}) {
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!update) {
    return null
  }

  const install = async () => {
    setInstalling(true)
    setError(null)
    try {
      await update.downloadAndInstall()
      await relaunch()
    } catch (err) {
      setError(String(err))
      setInstalling(false)
    }
  }

  return (
    <div className="border-t border-line pt-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">update</p>
      <p className="mt-2 font-display text-2xl leading-none">{update.version}</p>
      {canSelf ? (
        <button
          onClick={install}
          disabled={installing}
          className="mt-4 w-full border border-accent px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent hover:text-paper disabled:cursor-progress disabled:opacity-50"
        >
          {installing ? 'installing…' : 'update now'}
        </button>
      ) : (
        <button
          onClick={() => openUrl(RELEASES).catch(err => setError(String(err)))}
          className="mt-4 w-full border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          view release
        </button>
      )}
      {error && <p className="mt-2 font-mono text-[10px] leading-snug text-accent">{error}</p>}
    </div>
  )
}
