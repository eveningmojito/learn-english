import { useEffect, useState } from 'react'
import App from './App'
import { ProfilePicker } from './components/Profiles'
import { createProfile, deleteProfile, liveProfiles, migrateOldProgress, touchProfile, updateProfile } from './profiles'
import { applyCopy, clearCopyFromAddress, readCopy, type Copy } from './transfer'
import { ConfirmCopy } from './components/Transfer'
import { onSaved, setScope } from './utils'

// Ask the browser not to clear saved progress when the device is low on space.
navigator.storage?.persist?.().catch(() => {})

// Chooses who is playing, then shows the app with that kid's own progress.
export function Root() {
  const [profiles, setProfiles] = useState(() => {
    migrateOldProgress()
    return liveProfiles()
  })
  // A device with only one kid goes straight to the games.
  const [current, setCurrent] = useState<string | null>(() => (profiles.length === 1 ? profiles[0].id : null))

  // Must happen before App's state reads its saved data.
  setScope(current ?? '')

  // A profile copied from another device, waiting for a yes.
  const [copy, setCopy] = useState<Copy | null>(null)
  useEffect(() => {
    const check = () =>
      readCopy(location.href).then((c) => {
        clearCopyFromAddress()
        if (c) setCopy(c)
      })
    check()
    // Also when a copy link opens in a tab where the app is already running.
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [])

  // Remember when each profile last changed, ready for syncing between devices later.
  useEffect(() => onSaved(touchProfile), [])

  const refresh = () => setProfiles(liveProfiles())
  const player = profiles.find((p) => p.id === current)

  if (copy)
    return (
      <ConfirmCopy
        copy={copy}
        existing={profiles.find((p) => p.id === copy.profile.id)}
        onYes={() => {
          applyCopy(copy)
          setCopy(null)
          refresh()
          setCurrent(copy.profile.id)
        }}
        onNo={() => setCopy(null)}
      />
    )

  if (!player)
    return (
      <ProfilePicker
        profiles={profiles}
        onPick={setCurrent}
        onCreate={(name, avatar) => {
          setCurrent(createProfile(name, avatar).id)
          refresh()
        }}
        onEdit={(id, name, avatar) => {
          updateProfile(id, { name, avatar })
          refresh()
        }}
        onDelete={(id) => {
          deleteProfile(id)
          refresh()
        }}
        onCopy={(c) => {
          setCopy(c)
          setCurrent(null)
        }}
      />
    )

  return <App key={player.id} player={player} onSwitchPlayer={() => setCurrent(null)} />
}
