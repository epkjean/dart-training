import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mainZones, majorZones, recentThrows, statistics } from '../src/training/model.ts'
import type { Dart, Zone } from '../src/training/model.ts'
function dartsFor(zone: Zone, count: number, sessionId = 'one'): Dart[] {
  return Array.from({ length: count }, (_, index) => ({ id: `${sessionId}-${zone}-${index}`, sessionId, timestamp: '2026-11-17T18:00:00Z', trainingType: 'triple20', target: 'T20', resultZone: zone }))
}
test('requirements acceptance example uses all 100 raw throws', () => {
  const darts = [...dartsFor('T20', 20), ...dartsFor('High 20', 30), ...dartsFor('Low 5', 25), ...dartsFor('T1', 15), ...dartsFor('Over 20', 10)]
  const stats = statistics(darts)
  assert.equal(stats.count, 100)
  assert.equal(stats.t20, 20)
  assert.equal(stats.total20, 50)
  assert.equal(stats.left, 25)
  assert.equal(stats.right, 15)
  assert.equal(stats.major, 10)
  assert.equal(Object.values(stats.distribution).reduce((sum, value) => sum + value, 0), 100)
})
test('rolling statistics cross session boundaries and preserve tied timestamp order', () => {
  const darts = [...dartsFor('T20', 90, 'earlier'), ...dartsFor('Low 20', 30, 'latest')]
  const recent = recentThrows(darts, 100)
  assert.equal(recent.length, 100)
  assert.equal(recent.filter(dart => dart.sessionId === 'earlier').length, 70)
  assert.equal(statistics(recent).t20, 70)
  assert.equal(statistics(recent).total20, 100)
})
test('empty input and every result zone remain well defined', () => {
  assert.equal(statistics([]).t20, 0)
  const stats = statistics([...mainZones, ...majorZones].flatMap(zone => dartsFor(zone, 1)))
  assert.equal(stats.count, 13)
  assert.equal(stats.zones.T20, 1)
  assert.equal(Object.keys(stats.zones).length, 13)
  assert.ok(Math.abs(Object.values(stats.distribution).reduce((sum, value) => sum + value, 0) - 100) < 0.00001)
})
