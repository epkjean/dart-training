import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rollingTrend, selectRange, trainingHistory, metrics } from '../src/statistics/history.ts'
import { statistics } from '../src/training/model.ts'
import type { Dart, Session, Zone } from '../src/training/model.ts'
function session(id: string, startedAt: string, endedAt: string | null = startedAt): Session {
  return { id, trainingType: 'triple20', startedAt, endedAt }
}
function darts(count: number, sessionId: string, zone: Zone): Dart[] {
  return Array.from({ length: count }, (_, index) => ({ id: `${sessionId}:${String(index + 1).padStart(9, '0')}`, sessionId, timestamp: '2026-11-17T18:00:00.000Z', trainingType: 'triple20', target: 'T20', resultZone: zone }))
}
test('history orders tied throw timestamps by session start and sequence, excluding other training and orphan throws', () => {
  const sessions = [session('z', '2026-11-17T17:00:00Z'), session('a', '2026-11-17T18:00:00Z', null), { ...session('other', '2026-11-17T16:00:00Z'), trainingType: 'doubles' } as unknown as Session]
  const input = [...darts(30, 'a', 'Low 20'), ...darts(90, 'z', 'T20'), ...darts(5, 'orphan', 'T1'), ...darts(5, 'other', 'T5'), { ...darts(1, 'a', 'T1')[0], trainingType: 'doubles' } as unknown as Dart].reverse()
  const history = trainingHistory(sessions, input)
  assert.equal(history.darts.length, 120)
  assert.equal(history.darts[0].id, 'z:000000001')
  assert.equal(history.darts.at(-1)!.id, 'a:000000030')
  assert.equal(history.completedSessions, 1)
  assert.equal(history.firstSession, sessions[0].startedAt)
  assert.equal(history.latestSession, sessions[1].startedAt)
  assert.equal(statistics(selectRange(history.darts, 100)).t20, 70)
  assert.equal(statistics(selectRange(history.darts, 50)).t20, 40)
  assert.equal(selectRange(history.darts, 500).length, 120)
  assert.equal(selectRange(history.darts, 'lifetime').length, 120)
})
test('rolling trend moves across session boundaries and uses full windows only', () => {
  const input = [...darts(70, 'one', 'T20'), ...darts(50, 'two', 'Low 20')]
  const trend = rollingTrend(input, 100, 't20')
  assert.equal(trend.length, 21)
  assert.deepEqual(trend[0], { throwNumber: 100, value: 70 })
  assert.deepEqual(trend.at(-1), { throwNumber: 120, value: 50 })
  assert.equal(rollingTrend(input, 500, 't20').length, 0)
  assert.equal(rollingTrend(input, 50, 'total20').at(-1)!.value, 100)
  assert.equal(rollingTrend([], 50, 't20').length, 0)
})
test('trend metric definitions agree with raw statistics for each of the 13 zones', () => {
  const zones: Zone[] = ['High 5', 'High 20', 'High 1', 'T5', 'T20', 'T1', 'Low 5', 'Low 20', 'Low 1', 'Left of 5', 'Right of 1', 'Over 20', 'Below 20']
  const input = Array.from({ length: 100 }, (_, index) => ({ ...darts(1, 'one', zones[index % 13])[0], id: String(index) }))
  const stats = statistics(input)
  for (const metric of metrics) {
    const value = metric.value in stats.distribution ? stats.distribution[metric.value as Zone] : stats[metric.value as 't20' | 'total20' | 'left' | 'right' | 'major' | 'high' | 'low']
    assert.equal(rollingTrend(input, 100, metric.value)[0].value, value, metric.label)
  }
})
test('100,000 raw throws produce all rolling windows without modifying the source', () => {
  const input = darts(100000, 'one', 'T20')
  const result = rollingTrend(input, 500, 't20')
  assert.equal(result.length, 99501)
  assert.equal(result.at(-1)!.value, 100)
  assert.equal(input.length, 100000)
})
test('empty history has no invented dates or completed sessions', () => {
  assert.deepEqual(trainingHistory([], []), { darts: [], completedSessions: 0, firstSession: null, latestSession: null })
})
