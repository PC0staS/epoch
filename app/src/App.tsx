import { useState, useEffect } from 'react'
import './App.css'
import { SnapshotSummary } from './models'
import { browserStatus } from './api'
import Loading from './Views/Loading'
import NoBrowser from './Views/NoBrowser'
import Home from './Views/Home'
import SnapshotComponent from './Views/Snapshot'
import HistoryComponent from './Views/History'
import Layout from './Layout'
import { check } from '@tauri-apps/plugin-updater'
import type { Update } from '@tauri-apps/plugin-updater'
import { canSelfUpdate } from './api'
import UpdateNotice from './UpdateNotice'

type Panel = { name: 'home' } | { name: 'history' } | { name: 'snapshot' }

type View =
  | { name: 'loading' }
  | { name: 'noBrowser'; message: string }
  | { name: 'app'; panel: Panel }

function App() {
  const [view, setView] = useState<View>({ name: 'loading' })
  const [listedSnapshots, setListedSnapshots] = useState<SnapshotSummary[]>([])
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null)
  const [update, setUpdate] = useState<Update | null>(null)
  const [canSelf, setCanSelf] = useState(false)

  useEffect(() => {
    browserStatus()
      .then(() => {
        setView({ name: 'app', panel: { name: 'home' } })
      })
      .catch(err => setView({ name: 'noBrowser', message: String(err) }))
  }, [])

  useEffect(() => {
    check()
      .then(setUpdate)
      .catch(err => console.error('Error checking for updates:', err))
    canSelfUpdate()
      .then(setCanSelf)
      .catch(err => console.error('Error checking for self-update capability:', err))
  }, [])

  const checkBrowser = () => {
    setView({ name: 'loading' })
    browserStatus()
      .then(() => setView({ name: 'app', panel: { name: 'home' } }))
      .catch(err => setView({ name: 'noBrowser', message: String(err) }))
  }

  useEffect(() => {
    if (selectedSnapshotId !== null) {
      setView({ name: 'app', panel: { name: 'snapshot' } })
    }
  }, [selectedSnapshotId])

  if (view.name === 'loading') {
    return <Loading />
  }

  if (view.name === 'noBrowser') {
    return <NoBrowser message={view.message} onCheck={checkBrowser} />
  }

  const renderPanel = () => {
    switch (view.panel.name) {
      case 'home':
        return <Home listedSnapshots={listedSnapshots} setListedSnapshots={setListedSnapshots} />
      case 'history':
        return (
          <HistoryComponent
            listedSnapshots={listedSnapshots}
            onSelectSnapshot={setSelectedSnapshotId}
          />
        )
      case 'snapshot':
        return selectedSnapshotId !== null ? (
          <SnapshotComponent snapshotId={selectedSnapshotId!} />
        ) : (
          <p>Selecciona una captura en el historial</p>
        )
    }
  }

  return (
    <Layout
      panel={view.panel.name}
      onNavigate={panel => setView({ name: 'app', panel })}
      sideBarUpdateNotice={<UpdateNotice update={update} canSelf={canSelf} />}
    >
      {renderPanel()}
    </Layout>
  )
}

export default App
