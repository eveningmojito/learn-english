import { useState } from 'react'
import { AVATARS, NAME_MAX, type Profile } from '../profiles'
import { speak } from '../audio'
import type { Copy } from '../transfer'
import { ScanProfile, ShareProfile } from './Transfer'

type PickerProps = {
  profiles: Profile[]
  onPick: (id: string) => void
  onCreate: (name: string, avatar: string) => void
  onEdit: (id: string, name: string, avatar: string) => void
  onDelete: (id: string) => void
  onCopy: (copy: Copy) => void
}

// "Who is playing?": the first screen when the device has several kids, or none yet.
export function ProfilePicker({ profiles, onPick, onCreate, onEdit, onDelete, onCopy }: PickerProps) {
  const [form, setForm] = useState<{ edit?: Profile } | null>(null)
  const [editing, setEditing] = useState(false)
  const [share, setShare] = useState<Profile | null>(null)
  const [scan, setScan] = useState(false)

  if (share) return <ShareProfile profile={share} onBack={() => setShare(null)} />
  if (scan)
    return (
      <ScanProfile
        onBack={() => setScan(false)}
        onFound={(copy) => {
          setScan(false)
          onCopy(copy)
        }}
      />
    )
  if (form)
    return (
      <ProfileForm
        profile={form.edit}
        canCancel={profiles.length > 0}
        onCancel={() => setForm(null)}
        onShare={
          form.edit
            ? (name, avatar) => {
                // Save the name and animal chosen on this screen first, so the copy carries them.
                onEdit(form.edit!.id, name, avatar)
                setForm(null)
                setEditing(false)
                setShare({ ...form.edit!, name: name.trim(), avatar })
              }
            : undefined
        }
        onDone={(name, avatar) => {
          if (form.edit) onEdit(form.edit.id, name, avatar)
          else onCreate(name, avatar)
          setForm(null)
          setEditing(false)
        }}
        onDelete={
          form.edit
            ? () => {
                onDelete(form.edit!.id)
                setForm(null)
              }
            : undefined
        }
      />
    )

  return (
    <div className="screen">
      <h1 className="title" onClick={() => speak('Who is playing?')}>
        👋 Chi gioca?
      </h1>
      <div className="grid profiles">
        {profiles.map((p) => (
          <button
            key={p.id}
            className={`profile ${editing ? 'editing' : ''}`}
            onClick={() => (editing ? setForm({ edit: p }) : onPick(p.id))}
          >
            <span className="profile-avatar">{p.avatar}</span>
            <span className="profile-name">{p.name}</span>
            {editing && <span className="profile-edit">✏️</span>}
          </button>
        ))}
        <button className="profile add" onClick={() => setForm({})} aria-label="Nuovo giocatore">
          <span className="profile-avatar">➕</span>
          <span className="profile-name">Nuovo</span>
        </button>
      </div>
      <div className="profile-tools">
        {profiles.length > 0 && (
          <button className="help" onClick={() => setEditing(!editing)}>
            {editing ? '✓ Fatto' : '✏️ Modifica'}
          </button>
        )}
        {'mediaDevices' in navigator && (
          <button className="help" onClick={() => setScan(true)}>
            📷 Ricevi
          </button>
        )}
      </div>
    </div>
  )
}

function ProfileForm({
  profile,
  canCancel,
  onCancel,
  onDone,
  onDelete,
  onShare,
}: {
  profile?: Profile
  canCancel: boolean
  onCancel: () => void
  onDone: (name: string, avatar: string) => void
  onDelete?: () => void
  onShare?: (name: string, avatar: string) => void
}) {
  const [name, setName] = useState(profile?.name ?? '')
  const [avatar, setAvatar] = useState(profile?.avatar ?? AVATARS[0])
  const [confirm, setConfirm] = useState(false)
  const ok = name.trim().length > 0
  return (
    <div className="screen">
      <header className="topbar">
        {canCancel ? (
          <button className="round" onClick={onCancel} aria-label="Indietro">⬅️</button>
        ) : (
          <span />
        )}
        <h2>{profile ? 'Modifica' : 'Nuovo giocatore'}</h2>
        <span />
      </header>
      <div className="profile-preview">{avatar}</div>
      <label className="profile-field">
        <span>Come ti chiami? (solo il nome o un soprannome)</span>
        <input
          value={name}
          maxLength={NAME_MAX}
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ok && onDone(name, avatar)}
          placeholder="Nome"
        />
      </label>
      <div className="grid avatars" role="radiogroup" aria-label="Animale">
        {AVATARS.map((a) => (
          <button key={a} role="radio" aria-checked={a === avatar} className={`avatar ${a === avatar ? 'on' : ''}`} onClick={() => setAvatar(a)}>
            {a}
          </button>
        ))}
      </div>
      <button className="big" disabled={!ok} onClick={() => onDone(name, avatar)}>
        ✓ Fatto
      </button>
      {onShare && (
        <button className="help" disabled={!ok} onClick={() => onShare(name, avatar)}>
          📤 Copia su un altro dispositivo
        </button>
      )}
      {onDelete && (
        <button className="help danger" onClick={() => (confirm ? onDelete() : setConfirm(true))}>
          {confirm ? '⚠️ Tocca ancora per cancellare tutti i suoi progressi' : '🗑️ Cancella giocatore'}
        </button>
      )}
    </div>
  )
}
