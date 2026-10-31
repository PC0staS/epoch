import { useState, useEffect } from 'react'
import './App.css'
import { BrowserInfo, SnapshotSummary } from './models'
import { browserStatus } from './api'
import Loading from './Views/Loading'
import NoBrowser from './Views/NoBrowser'
import Home from './Views/Home'
import Snapshot from './Views/Snapshot'
import HistoryComponent from './Views/History'
import Layout from './Layout'

type View =
  | { name: 'loading' }
  | { name: 'noBrowser'; message: string }
  | { name: 'home' }
  | { name: 'history' }
  | { name: 'snapshot'; id: number; from: 'home' | 'history' }

function App() {
  const [view, setView] = useState<View>({ name: 'loading' })
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [listedSnapshots, setListedSnapshots] = useState<SnapshotSummary[]>([])

  useEffect(() => {
    browserStatus()
      .then(info => {
        setBrowserInfo(info)
        setView({ name: 'home' })
      })
      .catch(err => setView({ name: 'noBrowser', message: String(err) }))
  }, [])

  const checkBrowser = () => {
    setView({ name: 'loading' })
    browserStatus()
      .then(() => setView({ name: 'home' }))
      .catch(err => setView({ name: 'noBrowser', message: String(err) }))
  }return <Layout children={
  switch (view.name) {
    case 'loading':
      return <Loading />
    case 'noBrowser':
      return <NoBrowser message={view.message} onCheck={checkBrowser} />
    case 'home':
      return <Home listedSnapshots={listedSnapshots} setListedSnapshots={setListedSnapshots} />
    case 'history':
      return <HistoryComponent />
    case 'snapshot':
      return <Snapshot />
  }} />
}

export default App
