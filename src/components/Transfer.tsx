import { useEffect, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import type { Profile } from '../profiles'
import { copyLink, readCopy, type Copy } from '../transfer'

function QrSvg({ text }: { text: string }) {
  const qr = qrcode(0, 'L')
  qr.addData(text)
  qr.make()
  const n = qr.getModuleCount()
  let path = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c + 4} ${r + 4}h1v1h-1z`
  return (
    <svg className="qr" viewBox={`0 0 ${n + 8} ${n + 8}`} role="img" aria-label="Codice QR" shapeRendering="crispEdges">
      <rect width={n + 8} height={n + 8} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  )
}

// Shows a QR code that carries this profile to another device.
export function ShareProfile({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const [link, setLink] = useState('')
  useEffect(() => {
    copyLink(profile.id).then(setLink)
  }, [profile.id])
  return (
    <div className="screen">
      <header className="topbar">
        <button className="round" onClick={onBack} aria-label="Indietro">⬅️</button>
        <h2>📤 Copia {profile.avatar} {profile.name}</h2>
        <span />
      </header>
      <div className="transfer-box">
        {link ? <QrSvg text={link} /> : <p className="hint">Un momento…</p>}
        <p>
          Sull’altro dispositivo inquadra questo codice con la <b>fotocamera</b>, oppure apri l’app e tocca <b>📷 Ricevi</b>.
        </p>
        <p className="hint">Si copiano livello, stelle, monete e casa. I progressi fatti dopo non si aggiornano da soli: per portarli di nuovo, rifai la copia.</p>
      </div>
    </div>
  )
}

// Reads a profile QR code with this device's camera.
export function ScanProfile({ onFound, onBack }: { onFound: (copy: Copy) => void; onBack: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const [wrong, setWrong] = useState(false)
  const found = useRef(onFound)
  useEffect(() => {
    found.current = onFound
  })

  useEffect(() => {
    let stream: MediaStream | undefined
    let frame = 0
    let stopped = false
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!

    async function start() {
      const { default: jsQR } = await import('jsqr')
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      } catch {
        setError('Non riesco ad usare la fotocamera. Controlla di aver dato il permesso.')
        return
      }
      if (stopped) return stream.getTracks().forEach((t) => t.stop())
      const v = video.current!
      v.srcObject = stream
      await v.play().catch(() => {})
      let busy = false
      const tick = async () => {
        if (stopped) return
        if (!busy && v.videoWidth) {
          canvas.width = v.videoWidth
          canvas.height = v.videoHeight
          ctx.drawImage(v, 0, 0)
          const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' })
          if (code?.data) {
            busy = true
            const copy = await readCopy(code.data)
            if (copy && !stopped) return found.current(copy)
            setWrong(true)
            busy = false
          }
        }
        frame = requestAnimationFrame(tick)
      }
      tick()
    }
    start()
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="screen">
      <header className="topbar">
        <button className="round" onClick={onBack} aria-label="Indietro">⬅️</button>
        <h2>📷 Ricevi un giocatore</h2>
        <span />
      </header>
      <div className="transfer-box">
        {error ? <p className="sync-error">{error}</p> : <video ref={video} className="scanner" muted playsInline />}
        <p>Inquadra il codice QR mostrato dall’altro dispositivo (✏️ Modifica → giocatore → 📤 Copia).</p>
        {wrong && <p className="sync-error">Questo codice non è un giocatore di questa app.</p>}
      </div>
    </div>
  )
}

// Asks before adding a profile that arrived from another device.
export function ConfirmCopy({ copy, existing, onYes, onNo }: { copy: Copy; existing?: Profile; onYes: () => void; onNo: () => void }) {
  const wallet = copy.data['learn-english-wallet'] as { coins?: number } | undefined
  const best = (copy.data['learn-english-progress'] ?? {}) as Record<string, number>
  const stars = Object.values(best).reduce((a, b) => a + (Number(b) || 0), 0)
  return (
    <div className="screen center">
      <div className="profile-preview">{copy.profile.avatar}</div>
      <h2>{copy.profile.name}</h2>
      <p className="hint">
        ⭐ {stars} · 🪙 {wallet?.coins ?? 30}
      </p>
      <p className="transfer-question">
        {existing ? `Su questo dispositivo c’è già ${existing.avatar} ${existing.name}: lo sostituisco con questa copia?` : 'Aggiungo questo giocatore a questo dispositivo?'}
      </p>
      <button className="big" onClick={onYes}>
        ✓ Sì
      </button>
      <button className="help" onClick={onNo}>
        No, grazie
      </button>
    </div>
  )
}
