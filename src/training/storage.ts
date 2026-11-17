import type { Dart, Session } from './model'

let database: Promise<IDBDatabase> | undefined
function openDatabase() {
  database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('dart-training', 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore('sessions', { keyPath: 'id' })
      const throws = request.result.createObjectStore('throws', { keyPath: 'id', autoIncrement: false })
      throws.createIndex('sessionId', 'sessionId')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => { database = undefined; reject(request.error) }
  })
  return database
}
function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
function completed(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('Storage transaction aborted'))
    transaction.onerror = () => reject(transaction.error)
  })
}
export async function loadActiveSession() {
  const db = await openDatabase()
  const tx = db.transaction(['sessions', 'throws'], 'readonly')
  const done = completed(tx)
  const sessions = await requestValue<Session[]>(tx.objectStore('sessions').getAll())
  const session = sessions.find(item => item.endedAt === null) ?? null
  // Queue this request inside the same IndexedDB transaction.
  const darts = session ? await requestValue<Dart[]>(tx.objectStore('throws').index('sessionId').getAll(session.id)) : []
  await done
  return { session, darts: darts.sort((a, b) => a.id.localeCompare(b.id)) }
}
export async function startSession(): Promise<Session> {
  const db = await openDatabase()
  const tx = db.transaction('sessions', 'readwrite')
  const done = completed(tx)
  const sessions = await requestValue<Session[]>(tx.objectStore('sessions').getAll())
  const session = sessions.find(item => item.endedAt === null) ?? {
    id: crypto.randomUUID(), trainingType: 'triple20' as const,
    startedAt: new Date().toISOString(), endedAt: null,
  }
  tx.objectStore('sessions').put(session)
  await done
  return session
}
export async function saveDart(dart: Dart) {
  const db = await openDatabase()
  const tx = db.transaction('throws', 'readwrite')
  const done = completed(tx)
  tx.objectStore('throws').add(dart)
  await done
}
export async function deleteDart(id: string) {
  const db = await openDatabase()
  const tx = db.transaction('throws', 'readwrite')
  const done = completed(tx)
  tx.objectStore('throws').delete(id)
  await done
}
export async function endSession(session: Session) {
  const db = await openDatabase()
  const tx = db.transaction('sessions', 'readwrite')
  const done = completed(tx)
  tx.objectStore('sessions').put(session)
  await done
}
export async function exportBackup() {
  const db = await openDatabase()
  const tx = db.transaction(['sessions', 'throws'], 'readonly')
  const done = completed(tx)
  const [sessions, throws] = await Promise.all([
    requestValue<Session[]>(tx.objectStore('sessions').getAll()),
    requestValue<Dart[]>(tx.objectStore('throws').getAll()),
  ])
  await done
  const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, sessions, throws }, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `dart-training-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function loadCompletedSessions() {
  const db = await openDatabase()
  const tx = db.transaction(['sessions', 'throws'], 'readonly')
  const done = completed(tx)
  const sessions = await requestValue<Session[]>(tx.objectStore('sessions').getAll())
  const completedSessions = sessions.filter(session => session.trainingType === 'triple20' && session.endedAt !== null)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt) || b.id.localeCompare(a.id))
  // Count through the existing index instead of loading every historical dart.
  const rows = await Promise.all(completedSessions.map(async session => ({
    session, count: await requestValue(tx.objectStore('throws').index('sessionId').count(session.id)),
  })))
  await done
  return rows
}
export async function loadSessionDetail(sessionId: string) {
  const db = await openDatabase()
  const tx = db.transaction(['sessions', 'throws'], 'readonly')
  const done = completed(tx)
  const [session, darts] = await Promise.all([
    requestValue<Session | undefined>(tx.objectStore('sessions').get(sessionId)),
    requestValue<Dart[]>(tx.objectStore('throws').index('sessionId').getAll(sessionId)),
  ])
  await done
  if (!session || session.endedAt === null || session.trainingType !== 'triple20') return null
  return { session, darts: darts.filter(dart => dart.trainingType === 'triple20') }
}

export async function loadHistory() {
  const db = await openDatabase()
  const tx = db.transaction(['sessions', 'throws'], 'readonly')
  const done = completed(tx)
  const [sessions, darts] = await Promise.all([
    requestValue<Session[]>(tx.objectStore('sessions').getAll()),
    requestValue<Dart[]>(tx.objectStore('throws').getAll()),
  ])
  await done
  return { sessions, darts }
}
