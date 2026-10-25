export function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Saved settings and progress live in localStorage; if it is unavailable they last for this visit only.
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable: keep it for this visit only
  }
}

const SEEN_KEY = 'learn-english-seen'

// Picks `count` items, preferring ones not used in the last few games for this key,
// so each game shows different words or sentences until the whole pool has been used.
export function pickFresh<T>(key: string, pool: T[], count: number, id: (item: T) => string): T[] {
  const seenAll = load<Record<string, string[]>>(SEEN_KEY, {})
  const seen = seenAll[key] ?? []
  const fresh = shuffle(pool.filter((p) => !seen.includes(id(p))))
  const old = seen.map((s) => pool.find((p) => id(p) === s)).filter((p): p is T => p !== undefined)
  const picked = [...fresh, ...old].slice(0, count)
  const ids = picked.map(id)
  const remember = Math.max(0, pool.length - count)
  seenAll[key] = remember ? [...seen.filter((s) => !ids.includes(s)), ...ids].slice(-remember) : []
  save(SEEN_KEY, seenAll)
  return shuffle(picked)
}
