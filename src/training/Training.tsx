import { useEffect, useRef, useState } from 'react'
import { mainZones, majorZones, statistics } from './model'
import type { Dart, Session, Zone } from './model'
import { deleteDart, endSession, exportBackup, loadActiveSession, saveDart, startSession } from './storage'
import './Training.css'

function duration(start: string, end: string | null, now: number) {
  const seconds = Math.max(0, Math.floor(((end ? Date.parse(end) : now) - Date.parse(start)) / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
export default function Training() {
  const [session, setSession] = useState<Session | null>(null)
  const [darts, setDarts] = useState<Dart[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const locked = useRef(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [showSummary, setShowSummary] = useState(false)
  const active = session !== null && session.endedAt === null
  const stats = statistics(darts)

  useEffect(() => {
    let mounted = true
    loadActiveSession().then(result => {
      if (mounted) { setSession(result.session); setDarts(result.darts); setLoading(false) }
    }).catch(() => { if (mounted) { setError('Could not open local storage. Reload to try again.'); setLoading(false) } })
    return () => { mounted = false }
  }, [])
  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [active])

  async function perform(action: () => Promise<void>) {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    try { await action() } catch { setError('Could not save the change. Your previous darts are unchanged. Please try again.') }
    finally { locked.current = false; setBusy(false) }
  }
  function start() {
    void perform(async () => {
      await startSession()
      const result = await loadActiveSession()
      setSession(result.session); setDarts(result.darts); setShowSummary(false)
      setNow(Date.now()); setMessage('Session started. Aim at T20.')
    })
  }
  function record(zone: Zone) {
    if (!active || !session) return
    void perform(async () => {
      const dart: Dart = {
        // Session-local sequence keeps recording order stable even within one millisecond.
        id: `${session.id}:${String(darts.length + 1).padStart(9, '0')}`,
        sessionId: session.id, timestamp: new Date().toISOString(),
        trainingType: 'triple20', target: 'T20', resultZone: zone,
      }
      await saveDart(dart)
      setDarts(previous => [...previous, dart]); setMessage(`Dart ${darts.length + 1} saved: ${zone}`)
    })
  }
  const disabled = loading || busy
  return (
    <div className="training-screen">
      {loading && <p role="status">Loading saved session…</p>}
      {error && <p className="storage-error" role="alert">{error}</p>}
      <p className="save-feedback" role="status">{message}</p>
      {session && <div className="session-meta"><strong>{active ? 'Session active' : 'Session completed'}</strong><span>Started {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span>Duration {duration(session.startedAt, session.endedAt, now)}</span></div>}
      {!session && <div className="session-intro"><p>Aim at T20, then tap where each dart lands.</p><button className="primary-action" disabled={disabled || !!error} onClick={start}>Start Session</button></div>}
      {(!session || active) && <>
        <div className="zone-grid" aria-label="Target area">{mainZones.map(zone => <button key={zone} className={zone === 'T20' ? 'zone bull-target' : 'zone'} disabled={!active || disabled} onClick={() => record(zone)}>{zone}</button>)}</div>
        <p className="eyebrow miss-label">MAJOR MISSES</p>
        <div className="miss-grid">{majorZones.map(zone => <button className="zone" key={zone} disabled={!active || disabled} onClick={() => record(zone)}>{zone}</button>)}</div>
      </>}
      {session && <dl className="live-stats" aria-label="Session statistics">{[
        ['Darts', String(stats.count)], ['T20', `${stats.t20.toFixed(1)}%`], ['20 segment', `${stats.total20.toFixed(1)}%`],
        ['5-side misses', `${stats.left.toFixed(1)}%`], ['1-side misses', `${stats.right.toFixed(1)}%`], ['Major misses', `${stats.major.toFixed(1)}%`],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
      {active && <div className="session-actions"><button className="secondary-action" disabled={disabled || !darts.length} onClick={() => void perform(async () => {
        await deleteDart(darts[darts.length - 1].id); setDarts(previous => previous.slice(0, -1)); setMessage('Last dart removed.')
      })}>Undo Last Dart</button><button className="primary-action" disabled={disabled} onClick={() => void perform(async () => {
        const finished = { ...session!, endedAt: new Date().toISOString() }
        await endSession(finished); setSession(finished); setMessage('Session saved and completed.')
      })}>End Session</button></div>}
      {session?.endedAt && <>
        <div className="session-actions"><button className="primary-action" onClick={() => setShowSummary(value => !value)}>{showSummary ? 'Hide' : 'View'} Session Statistics</button><button className="secondary-action" disabled={disabled} onClick={() => void perform(exportBackup)}>Download JSON Backup</button></div>
        {showSummary && <dl className="zone-summary">{[...mainZones, ...majorZones].map(zone => <div key={zone}><dt>{zone}</dt><dd>{stats.distribution[zone].toFixed(1)}%</dd></div>)}</dl>}
        <p className="session-note">Your session is saved on this device. Use Back to Start Page to return.</p>
      </>}
    </div>
  )
}
