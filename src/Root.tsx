import { useEffect, useState } from 'react'
import App from './App'
import { ProfilePicker } from './components/Profiles'
import { createProfile, deleteProfile, liveProfiles, migrateOldProgress, touchProfile, updateProfile } from './profiles'
import { onSaved, setScope } from './utils'

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

  // Remember when each profile last changed, ready for syncing between devices later.
  useEffect(() => onSaved(touchProfile), [])

  const refresh = () => setProfiles(liveProfiles())
  const player = profiles.find((p) => p.id === current)

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
      />
    )

  return <App key={player.id} player={player} onSwitchPlayer={() => setCurrent(null)} />
}
