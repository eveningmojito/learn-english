import { scopedKey } from './utils'

// A profile is one kid: a nickname and an animal. Only these and the game progress are stored,
// never surnames, emails or birthdays. Each profile's progress lives in its own localStorage keys.

export type Profile = {
  id: string
  name: string
  avatar: string
  // When this profile or its progress last changed, in ms. Sync keeps the newest copy.
  updatedAt: number
  // Deleted profiles stay as a marker so the deletion also reaches the family's other devices.
  deleted?: boolean
}

export const AVATARS = ['🐯', '🐼', '🦊', '🐸', '🐵', '🐰', '🐨', '🦁', '🐶', '🐱', '🐷', '🐙', '🦄', '🐢', '🐧', '🦖']

const PROFILES_KEY = 'learn-english-app-profiles'
// Per-kid data keys written by the games before profiles existed.
const PREFIX = 'learn-english-'
export const NAME_MAX = 12

function readRaw<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeRaw(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable: keep it for this visit only
  }
}

function storageKeys(): string[] {
  try {
    return Object.keys(localStorage)
  } catch {
    return []
  }
}

export const allProfiles = () => readRaw<Profile[]>(PROFILES_KEY, [])
export const liveProfiles = () => allProfiles().filter((p) => !p.deleted)
export const saveProfiles = (list: Profile[]) => writeRaw(PROFILES_KEY, list)

const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export function createProfile(name: string, avatar: string): Profile {
  const p: Profile = { id: newId(), name: name.trim().slice(0, NAME_MAX), avatar, updatedAt: Date.now() }
  saveProfiles([...allProfiles(), p])
  return p
}

export function updateProfile(id: string, change: Partial<Pick<Profile, 'name' | 'avatar'>>) {
  saveProfiles(allProfiles().map((p) => (p.id === id ? { ...p, ...change, updatedAt: Date.now() } : p)))
}

export function deleteProfile(id: string) {
  setProfileData(id, {})
  saveProfiles(allProfiles().map((p) => (p.id === id ? { id, name: '', avatar: '', deleted: true, updatedAt: Date.now() } : p)))
}

export function touchProfile(id: string) {
  saveProfiles(allProfiles().map((p) => (p.id === id ? { ...p, updatedAt: Date.now() } : p)))
}

// All saved game data of one profile, keyed by the unscoped key (e.g. learn-english-wallet).
export function profileData(id: string): Record<string, unknown> {
  const suffix = `@${id}`
  const data: Record<string, unknown> = {}
  for (const k of storageKeys()) {
    if (k.startsWith(PREFIX) && k.endsWith(suffix)) data[k.slice(0, -suffix.length)] = readRaw(k, null)
  }
  return data
}

// Replaces one profile's game data with `data`.
export function setProfileData(id: string, data: Record<string, unknown>) {
  const suffix = `@${id}`
  for (const k of storageKeys()) {
    if (k.startsWith(PREFIX) && k.endsWith(suffix) && !(k.slice(0, -suffix.length) in data)) {
      try {
        localStorage.removeItem(k)
      } catch {
        // ignore
      }
    }
  }
  for (const [k, v] of Object.entries(data)) writeRaw(scopedKey(k, id), v)
}

// Progress saved before profiles existed becomes the first profile, so nothing is lost.
export function migrateOldProgress() {
  if (allProfiles().length) return
  const old = storageKeys().filter((k) => k.startsWith(PREFIX) && !k.startsWith('learn-english-app-') && !k.includes('@'))
  if (!old.length) return
  const p = createProfile('Io', '🐣')
  for (const k of old) {
    writeRaw(scopedKey(k, p.id), readRaw(k, null))
    try {
      localStorage.removeItem(k)
    } catch {
      // ignore
    }
  }
}
