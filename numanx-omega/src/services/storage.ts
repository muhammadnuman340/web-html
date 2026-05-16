import localforage from 'localforage'
import type { HistoryEntry, FavoriteEntry, CustomUnit } from '../types'

const store = localforage.createInstance({ name: 'nx-cos' })

export async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const val = await store.getItem<T>(key)
    return val !== null ? val : fallback
  } catch { return fallback }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try { await store.setItem(key, value) } catch { /* ignore */ }
}

export async function removeItem(key: string): Promise<void> {
  try { await store.removeItem(key) } catch { /* ignore */ }
}

// History
export async function getHistory(): Promise<HistoryEntry[]> {
  return getItem<HistoryEntry[]>('history', [])
}

export async function addHistory(entry: HistoryEntry): Promise<HistoryEntry[]> {
  const h = await getHistory()
  h.unshift(entry)
  if (h.length > 500) h.length = 500
  await setItem('history', h)
  return h
}

export async function clearHistory(): Promise<void> {
  await setItem('history', [])
}

export async function removeHistoryEntry(timestamp: number): Promise<HistoryEntry[]> {
  const h = await getHistory()
  const next = h.filter(x => x.t !== timestamp)
  await setItem('history', next)
  return next
}

export async function searchHistory(query: string): Promise<HistoryEntry[]> {
  const h = await getHistory()
  const q = query.toLowerCase()
  return h.filter(x =>
    x.fu.toLowerCase().includes(q) ||
    x.tu.toLowerCase().includes(q) ||
    x.cat.toLowerCase().includes(q) ||
    String(x.fv).includes(q)
  )
}

// Favorites
export async function getFavorites(): Promise<FavoriteEntry[]> {
  return getItem<FavoriteEntry[]>('favorites', [])
}

export async function toggleFavorite(entry: FavoriteEntry): Promise<FavoriteEntry[]> {
  const f = await getFavorites()
  const i = f.findIndex(x => x.cat === entry.cat && x.from === entry.from && x.to === entry.to)
  if (i >= 0) f.splice(i, 1)
  else f.push(entry)
  await setItem('favorites', f)
  return f
}

export async function removeFavorite(index: number): Promise<FavoriteEntry[]> {
  const f = await getFavorites()
  f.splice(index, 1)
  await setItem('favorites', f)
  return f
}

export async function groupFavorites(): Promise<Record<string, FavoriteEntry[]>> {
  const f = await getFavorites()
  const groups: Record<string, FavoriteEntry[]> = { Math: [], Currency: [], Science: [], Custom: [] }
  f.forEach(entry => {
    if (entry.cat === 'currency' || entry.cat === 'crypto') groups.Currency.push(entry)
    else if (['length', 'mass', 'volume', 'area', 'speed', 'temp', 'time'].includes(entry.cat)) groups.Math.push(entry)
    else if (['energy', 'force', 'pressure', 'frequency', 'density', 'astronomy'].includes(entry.cat)) groups.Science.push(entry)
    else groups.Custom.push(entry)
  })
  Object.keys(groups).forEach(k => { if (groups[k].length === 0) delete groups[k] })
  return groups
}

// Custom Units
export async function getCustomUnits(): Promise<CustomUnit[]> {
  return getItem<CustomUnit[]>('customUnits', [])
}

export async function saveCustomUnits(units: CustomUnit[]): Promise<void> {
  await setItem('customUnits', units)
}

// Currency Cache
export async function getCurrencyCache(): Promise<{ rates: Record<string, number>; timestamp: number } | null> {
  return getItem<{ rates: Record<string, number>; timestamp: number } | null>('currencyCache', null)
}

export async function setCurrencyCache(rates: Record<string, number>): Promise<void> {
  await setItem('currencyCache', { rates, timestamp: Date.now() })
}

// Analytics
export async function getAnalyticsData(): Promise<{ events: any[]; dailyStats: Record<string, number> }> {
  return getItem('analytics', { events: [], dailyStats: {} })
}

export async function saveAnalyticsData(data: { events: any[]; dailyStats: Record<string, number> }): Promise<void> {
  await setItem('analytics', data)
}

// User Patterns (for AI behavior)
export async function getUserPatterns(): Promise<Record<string, number>> {
  return getItem<Record<string, number>>('userPatterns', {})
}

export async function saveUserPatterns(patterns: Record<string, number>): Promise<void> {
  await setItem('userPatterns', patterns)
}

// All data export
export async function exportAllData(): Promise<string> {
  const data = {
    history: await getHistory(),
    favorites: await getFavorites(),
    customUnits: await getCustomUnits(),
    analytics: await getAnalyticsData(),
    userPatterns: await getUserPatterns(),
    exportedAt: new Date().toISOString()
  }
  return JSON.stringify(data, null, 2)
}

export async function importAllData(json: string): Promise<boolean> {
  try {
    const data = JSON.parse(json)
    if (data.history) await setItem('history', data.history)
    if (data.favorites) await setItem('favorites', data.favorites)
    if (data.customUnits) await setItem('customUnits', data.customUnits)
    if (data.analytics) await setItem('analytics', data.analytics)
    if (data.userPatterns) await setItem('userPatterns', data.userPatterns)
    return true
  } catch { return false }
}
