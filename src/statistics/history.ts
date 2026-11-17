import { mainZones, majorZones } from '../training/model.ts'
import type { Dart, Session, Zone } from '../training/model.ts'

export type Range = 50 | 100 | 500 | 'lifetime'
export type Metric = 't20' | 'total20' | 'left' | 'right' | 'major' | 'high' | 'low' | Zone
export const metrics: { value: Metric; label: string }[] = [
  { value: 't20', label: 'T20 hit rate' }, { value: 'total20', label: 'Total 20 segment' },
  { value: 'left', label: '5-side near misses' }, { value: 'right', label: '1-side near misses' },
  { value: 'major', label: 'Major misses' }, { value: 'high', label: 'High tendency' },
  { value: 'low', label: 'Low tendency' },
  ...[...mainZones, ...majorZones].map(zone => ({ value: zone, label: zone })),
]
// Sort across sessions by throw time, then session start and the saved sequence ID for tied times.
export function trainingHistory(sessions: readonly Session[], darts: readonly Dart[]) {
  const tripleSessions = sessions.filter(session => session.trainingType === 'triple20')
    .toSorted((a, b) => a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id))
  const byId = new Map(tripleSessions.map(session => [session.id, session]))
  const throws = darts.filter(dart => dart.trainingType === 'triple20' && byId.has(dart.sessionId))
    .toSorted((a, b) => a.timestamp.localeCompare(b.timestamp)
      || byId.get(a.sessionId)!.startedAt.localeCompare(byId.get(b.sessionId)!.startedAt)
      || a.id.localeCompare(b.id))
  return {
    darts: throws,
    completedSessions: tripleSessions.filter(session => session.endedAt !== null).length,
    firstSession: tripleSessions[0]?.startedAt ?? null,
    latestSession: tripleSessions.at(-1)?.startedAt ?? null,
  }
}
export function selectRange(darts: readonly Dart[], range: Range) {
  return range === 'lifetime' ? darts : darts.slice(-range)
}
function matches(zone: Zone, metric: Metric): boolean {
  switch (metric) {
    case 't20': return zone === 'T20'
    case 'total20': return zone === 'High 20' || zone === 'T20' || zone === 'Low 20'
    case 'left': return zone === 'High 5' || zone === 'T5' || zone === 'Low 5'
    case 'right': return zone === 'High 1' || zone === 'T1' || zone === 'Low 1'
    case 'major': return majorZones.some(item => item === zone)
    case 'high': return zone.startsWith('High ') || zone === 'Over 20'
    case 'low': return zone.startsWith('Low ') || zone === 'Below 20'
    default: return zone === metric
  }
}
// One pass over raw throws: only complete rolling windows are included.
export function rollingTrend(darts: readonly Dart[], window: 50 | 100 | 500, metric: Metric) {
  const points: { throwNumber: number; value: number }[] = []
  let hits = 0
  for (let index = 0; index < darts.length; index++) {
    if (matches(darts[index].resultZone, metric)) hits++
    if (index >= window && matches(darts[index - window].resultZone, metric)) hits--
    if (index >= window - 1) points.push({ throwNumber: index + 1, value: hits / window * 100 })
  }
  return points
}
