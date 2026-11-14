import { allProfiles, profileData, saveProfiles, setProfileData, type Profile } from './profiles'

// Copies one profile to another device through a QR code, with no server: the code is a link
// to the app that carries the profile's progress, compressed. Scanning it with the other device's
// camera (or the app's own scanner) opens the app there and offers to add the profile.

export type Copy = { profile: Profile; data: Record<string, unknown> }

const PARAM = 'copy='
// Which words were shown recently is not worth the space in the code.
const SKIP = ['learn-english-seen']

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}

export async function copyLink(id: string): Promise<string> {
  const profile = allProfiles().find((p) => p.id === id)!
  const data = profileData(id)
  for (const k of SKIP) delete data[k]
  const { deleted: _, ...meta } = profile
  const json = JSON.stringify({ v: 1, p: meta, d: data })
  const packed = await pipe(new TextEncoder().encode(json), new CompressionStream('deflate-raw'))
  return `${location.origin}${import.meta.env.BASE_URL}#${PARAM}${toB64(packed)}`
}

// Reads a copy from a scanned link or from this page's address; null if it is not one.
export async function readCopy(link: string): Promise<Copy | null> {
  const at = link.indexOf(`#${PARAM}`)
  if (at < 0) return null
  try {
    const bytes = await pipe(fromB64(link.slice(at + PARAM.length + 1)), new DecompressionStream('deflate-raw'))
    const raw = JSON.parse(new TextDecoder().decode(bytes))
    const p = raw?.p
    if (raw?.v !== 1 || typeof p?.id !== 'string' || typeof p.name !== 'string' || typeof p.avatar !== 'string' || typeof raw.d !== 'object') return null
    const data: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(raw.d as Record<string, unknown>)) if (k.startsWith('learn-english-') && !k.startsWith('learn-english-app-')) data[k] = v
    return { profile: { id: p.id, name: String(p.name).slice(0, 12), avatar: p.avatar, updatedAt: Number(p.updatedAt) || Date.now() }, data }
  } catch {
    return null
  }
}

// Adds the copied profile, replacing this device's copy of the same profile if there is one.
export function applyCopy({ profile, data }: Copy) {
  setProfileData(profile.id, data)
  const others = allProfiles().filter((p) => p.id !== profile.id)
  saveProfiles([...others, { ...profile, updatedAt: Date.now() }])
}

export function clearCopyFromAddress() {
  if (location.hash.startsWith(`#${PARAM}`)) history.replaceState(history.state, '', location.pathname + location.search)
}
