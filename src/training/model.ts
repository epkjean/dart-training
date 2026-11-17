export const mainZones = ['High 5', 'High 20', 'High 1', 'T5', 'T20', 'T1', 'Low 5', 'Low 20', 'Low 1'] as const
export const majorZones = ['Left of 5', 'Over 20', 'Below 20', 'Right of 1'] as const
export type Zone = typeof mainZones[number] | typeof majorZones[number]
export interface Session {
  id: string
  trainingType: 'triple20'
  startedAt: string
  endedAt: string | null
}
export interface Dart {
  id: string
  sessionId: string
  timestamp: string
  trainingType: 'triple20'
  target: 'T20'
  resultZone: Zone
}
export function statistics(darts: readonly Dart[]) {
  const zones = Object.fromEntries([...mainZones, ...majorZones].map(zone => [zone, 0])) as Record<Zone, number>
  for (const dart of darts) zones[dart.resultZone]++
  const percent = (count: number) => darts.length ? count / darts.length * 100 : 0
  return {
    count: darts.length, zones,
    t20: percent(zones.T20),
    total20: percent(zones['High 20'] + zones.T20 + zones['Low 20']),
    left: percent(zones['High 5'] + zones.T5 + zones['Low 5']),
    right: percent(zones['High 1'] + zones.T1 + zones['Low 1']),
    major: percent(majorZones.reduce((sum, zone) => sum + zones[zone], 0)),
    distribution: Object.fromEntries(Object.entries(zones).map(([zone, count]) => [zone, percent(count)])) as Record<Zone, number>,
  }
}
// Input order is recording order, including when timestamps are equal.
export function recentThrows(darts: readonly Dart[], limit: number) {
  return darts.filter(dart => dart.trainingType === 'triple20').slice(-limit)
}
