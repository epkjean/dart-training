import { useEffect, useMemo, useRef, useState } from 'react'
import { mainZones, majorZones, roundedDistribution, statistics } from '../training/model'
import type { Dart, Session } from '../training/model'
import { loadHistory } from '../training/storage'
import { metrics, rollingTrend, selectRange, trainingHistory } from './history'
import type { Metric, Range } from './history'
import './FullStatistics.css'

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString([], { dateStyle: 'medium' }) : '—'
}
export default function FullStatistics() {
  const [data, setData] = useState<{ sessions: Session[]; darts: Dart[] } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const [range, setRange] = useState<Range>(100)
  const [window, setWindow] = useState<50 | 100 | 500>(100)
  const [metric, setMetric] = useState<Metric>('t20')
  const chartHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    let mounted = true
    loadHistory().then(result => { if (mounted) { setData(result); setLoading(false) } })
      .catch(() => { if (mounted) { setError('Could not load history. Please try again.'); setLoading(false) } })
    return () => { mounted = false }
  }, [reload])
  const history = useMemo(() => trainingHistory(data?.sessions ?? [], data?.darts ?? []), [data])
  const selected = useMemo(() => selectRange(history.darts, range), [history, range])
  const stats = useMemo(() => statistics(selected), [selected])
  const distribution = useMemo(() => roundedDistribution(selected), [selected])
  const trend = useMemo(() => rollingTrend(history.darts, window, metric), [history, window, metric])
  // Keep the graph light even with 100,000 throws; calculations above include every throw.
  const plotted = useMemo(() => trend.length <= 600 ? trend : Array.from({ length: 600 }, (_, index) => trend[Math.round(index * (trend.length - 1) / 599)]), [trend])
  const points = plotted.map(point => `${55 + (point.throwNumber - (trend[0]?.throwNumber ?? 0)) / Math.max(1, (trend.at(-1)?.throwNumber ?? 0) - (trend[0]?.throwNumber ?? 0)) * 620},${225 - point.value * 1.9}`).join(' ')
  const metricLabel = metrics.find(item => item.value === metric)!.label
  if (loading) return <p role="status">Loading history…</p>
  if (error) return <><p className="storage-error" role="alert">{error}</p><button className="secondary-action" onClick={() => { setLoading(true); setError(''); setReload(value => value + 1) }}>Try Again</button></>
  return (
    <div className="full-statistics">
      <p className="session-note">Triple 20 Training · Includes saved throws from active and completed sessions. Reopen this page to refresh.</p>
      <dl className="history-overview"><div><dt>Total darts</dt><dd>{history.darts.length.toLocaleString()}</dd></div><div><dt>Completed sessions</dt><dd>{history.completedSessions.toLocaleString()}</dd></div><div><dt>First session</dt><dd>{date(history.firstSession)}</dd></div><div><dt>Latest session</dt><dd>{date(history.latestSession)}</dd></div></dl>
      <h3>Result distribution</h3>
      <div className="range-controls" role="group" aria-label="Throw range">{([50, 100, 500, 'lifetime'] as const).map(value => <button className="secondary-action" aria-pressed={range === value} key={value} onClick={() => setRange(value)}>{value === 'lifetime' ? 'Lifetime' : `Last ${value}`}</button>)}</div>
      <p className="session-note" role="status">{range === 'lifetime' ? 'Lifetime' : `Last ${range}`} · {stats.count.toLocaleString()} {stats.count === 1 ? 'dart' : 'darts'} available{range !== 'lifetime' && stats.count < range ? ` of ${range}` : ''}.</p>
      {history.darts.length === 0 && <div className="notice"><h3>No darts recorded yet</h3><p>Record darts in Triple 20 Training to start building your history. Empty sessions do not contribute to percentages.</p></div>}
      <dl className="live-stats">{[['T20', stats.t20], ['20 segment', stats.total20], ['5-side misses', stats.left], ['1-side misses', stats.right], ['Major misses', stats.major], ['High tendency', stats.high], ['Low tendency', stats.low]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{Number(value).toFixed(1)}%</dd></div>)}</dl>
      <p className="session-note">High = High 5, High 20, High 1 and Over 20. Low = Low 5, Low 20, Low 1 and Below 20.</p>
      <div className="distribution-grid" aria-label="Result distribution">{[...mainZones, ...majorZones].map(zone => <div className={`distribution-zone ${zone === 'T20' ? 'target-distribution' : ''}`} key={zone}><span>{zone}</span><strong>{distribution[zone].toFixed(1)}%</strong><small>{stats.zones[zone].toLocaleString()} darts</small></div>)}</div>
      <p className="session-note">Total: {stats.count ? '100.0%' : '0.0%'}. Rounded zone percentages are balanced to total 100% when darts are available.</p>
      <section className="trend-section" aria-labelledby="trend-title">
        <h3 id="trend-title" ref={chartHeading}>Performance over time</h3>
        <p className="session-note">The graph uses all saved throws across sessions, independently of the result-distribution filter above.</p>
        <div className="trend-controls"><label>Metric<select value={metric} onChange={event => setMetric(event.target.value as Metric)}>{metrics.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label>Rolling window<select value={window} onChange={event => setWindow(Number(event.target.value) as 50 | 100 | 500)}>{[50, 100, 500].map(value => <option value={value} key={value}>{value} throws</option>)}</select></label></div>
        {trend.length ? <>
          <p role="status" className="trend-caption">{metricLabel} · Latest {window} throws: <strong>{trend.at(-1)!.value.toFixed(1)}%</strong></p>
          <svg className="trend-chart" viewBox="0 0 710 280" role="img" aria-label={`${metricLabel}, rolling ${window} throws. From throw ${trend[0].throwNumber} to ${trend.at(-1)!.throwNumber}. Latest value ${trend.at(-1)!.value.toFixed(1)} percent.`}>
            <title>{metricLabel} — rolling {window} throws</title>
            {[0, 50, 100].map(value => <g key={value}><line x1="55" x2="675" y1={225 - value * 1.9} y2={225 - value * 1.9} stroke="#3a3d45" /><text x="45" y={230 - value * 1.9} textAnchor="end">{value}%</text></g>)}
            <polyline points={points} fill="none" stroke="#f2c94c" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx={plotted.length === 1 ? 55 : 675} cy={225 - trend.at(-1)!.value * 1.9} r="4" fill="#f2c94c" />
            <text x="55" y="250">{trend[0].throwNumber}</text>{trend.length > 1 && <text x="675" y="250" textAnchor="end">{trend.at(-1)!.throwNumber}</text>}
            <text x="365" y="275" textAnchor="middle">Throw number</text>
          </svg>
          <p className="session-note">Each point uses exactly {window} throws. {trend.length > 600 ? 'The graph shows 600 evenly spaced points; every rolling window is calculated.' : 'All complete rolling windows are shown.'}</p>
        </> : <p className="notice" role="status">A rolling {window}-throw trend needs at least {window} darts. {history.darts.length} recorded so far.</p>}
      </section>
    </div>
  )
}
