import { useEffect, useRef, useState } from 'react'
import type { Dart, Session } from '../training/model'
import { mainZones, majorZones, statistics, roundedDistribution } from '../training/model'
import { loadCompletedSessions, loadSessionDetail } from '../training/storage'
import './Sessions.css'

type SessionRow = { session: Session; count: number }
function elapsed(session: Session) {
  const seconds = Math.max(0, Math.floor((Date.parse(session.endedAt!) - Date.parse(session.startedAt)) / 1000))
  return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`
}
function dateTime(value: string) {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}
export default function Sessions() {
  const [view, setView] = useState<'menu' | 'sessions' | 'detail' | 'full'>('menu')
  const [rows, setRows] = useState<SessionRow[]>([])
  const [detail, setDetail] = useState<{ session: Session; darts: Dart[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(0)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (view !== 'menu') heading.current?.focus() }, [view])
  useEffect(() => () => { requestId.current++ }, [])

  async function listSessions() {
    const id = ++requestId.current
    setView('sessions'); setLoading(true); setError('')
    try { const result = await loadCompletedSessions(); if (id === requestId.current) setRows(result) }
    catch { if (id === requestId.current) setError('Could not load sessions. Please try again.') }
    finally { if (id === requestId.current) setLoading(false) }
  }
  async function openSession(sessionId: string) {
    const id = ++requestId.current
    setView('detail'); setLoading(true); setError(''); setDetail(null)
    try {
      const result = await loadSessionDetail(sessionId)
      if (id === requestId.current) {
        if (result) setDetail(result)
        else setError('This session could not be found. Return to Sessions to refresh the list.')
      }
    } catch { if (id === requestId.current) setError('Could not load this session. Return to Sessions and try again.') }
    finally { if (id === requestId.current) setLoading(false) }
  }
  const stats = detail ? statistics(detail.darts) : null
  const distribution = detail ? roundedDistribution(detail.darts) : null
  return (
    <div className="sessions-screen">
      {view === 'menu' ? <nav className="choices" aria-label="Statistics menu">
        <button className="choice statistics" onClick={() => void listSessions()}><span className="choice-copy"><span className="choice-title">View Sessions</span><span className="description">Revisit each completed Triple 20 session.</span></span><span aria-hidden="true">↗</span></button>
        <button className="choice" onClick={() => setView('full')}><span className="choice-copy"><span className="choice-title">View Full Statistics</span><span className="description">Lifetime statistics and trends — coming next.</span></span><span aria-hidden="true">↗</span></button>
      </nav> : <>
        <button className="secondary-action" onClick={() => {
          if (view === 'detail') void listSessions()
          else { requestId.current++; setError(''); setLoading(false); setView('menu') }
        }}>← {view === 'detail' ? 'Back to Sessions' : 'Back to Statistics'}</button>
        <h2 ref={heading} tabIndex={-1}>{view === 'sessions' ? 'View Sessions' : view === 'detail' ? 'Session Statistics' : 'Full Statistics'}</h2>
        {loading && <p role="status">Loading sessions…</p>}
        {error && <p className="storage-error" role="alert">{error}</p>}
        {view === 'sessions' && !loading && (error ? <button className="secondary-action" onClick={() => void listSessions()}>Try Again</button> : rows.length === 0 ? <div className="notice"><h3>No completed sessions yet</h3><p>Finish a Triple 20 training session to see it here. Active sessions stay in the training screen.</p></div> : <div className="session-list">{rows.map(({ session, count }) => <button className="session-row" key={session.id} onClick={() => void openSession(session.id)}>
          <span className="row-title">Triple 20 Training <span aria-hidden="true">↗</span></span><span>{dateTime(session.startedAt)}</span><span className="row-meta"><span>{count} darts</span><span>{elapsed(session)}</span></span>
        </button>)}</div>)}
        {view === 'detail' && !loading && detail && stats && distribution && <>
          <h3>Triple 20 Training</h3>
          <dl className="session-facts"><div><dt>Started</dt><dd>{dateTime(detail.session.startedAt)}</dd></div><div><dt>Stopped</dt><dd>{dateTime(detail.session.endedAt!)}</dd></div><div><dt>Duration</dt><dd>{elapsed(detail.session)}</dd></div><div><dt>Darts</dt><dd>{stats.count}</dd></div></dl>
          {stats.count === 0 && <p className="session-note">No darts were recorded in this session. Percentages are shown as 0%.</p>}
          <dl className="live-stats">{[['T20', stats.t20], ['20 segment', stats.total20], ['5-side misses', stats.left], ['1-side misses', stats.right], ['Major misses', stats.major], ['High tendency', stats.high], ['Low tendency', stats.low]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{Number(value).toFixed(1)}%</dd></div>)}</dl>
          <p className="session-note">High = High 5, High 20, High 1 and Over 20. Low = Low 5, Low 20, Low 1 and Below 20.</p>
          <h3>Result distribution</h3>
          <dl className="zone-summary">{[...mainZones, ...majorZones].map(zone => <div key={zone}><dt>{zone} <span className="zone-count">({stats.zones[zone]} darts)</span></dt><dd>{distribution[zone].toFixed(1)}%</dd></div>)}<div className="distribution-total"><dt>Total</dt><dd>{stats.count ? '100.0%' : '0.0%'}</dd></div></dl>
          <p className="session-note">Percentages are rounded to one decimal and balanced to total 100% for sessions with darts.</p>
        </>}
        {view === 'full' && <div className="notice"><h3>Coming next</h3><p>Historical ranges and trend graphs will be added in a later step. Individual sessions are available in View Sessions.</p></div>}
      </>}
    </div>
  )
}
