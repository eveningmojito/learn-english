// Hand-drawn backgrounds for the adventure stories, as plain SVG so nothing needs downloading.

export type SceneryId = 'village' | 'forest' | 'bridge' | 'cave' | 'castle' | 'school' | 'lab' | 'sky' | 'tower'

// Fixed "random" star positions so the sky doesn't change on every render.
const STARS = Array.from({ length: 28 }, (_, i) => ({ x: (i * 137) % 400, y: (i * 53) % 130, r: 0.8 + (i % 3) * 0.6 }))

function Sky({ from, to }: { from: string; to: string }) {
  const id = `sky-${from.slice(1)}-${to.slice(1)}`
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id})`} />
    </>
  )
}

function Stars() {
  return (
    <g fill="#fff8d0">
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} className="twinkle" style={{ animationDelay: `${(i % 7) * 0.4}s` }} />
      ))}
    </g>
  )
}

function Tree({ x, y, s = 1, color = '#2f8f46' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="-6" width="8" height="18" fill="#7a4b2a" />
      <polygon points="0,-60 -24,-18 24,-18" fill={color} />
      <polygon points="0,-45 -28,-2 28,-2" fill={color} />
    </g>
  )
}

function House({ x, y, wall, roof }: { x: number; y: number; wall: string; roof: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-22" y="-30" width="44" height="30" fill={wall} />
      <polygon points="-28,-30 0,-54 28,-30" fill={roof} />
      <rect x="-6" y="-16" width="12" height="16" fill="#7a4b2a" />
      <rect x="-17" y="-25" width="8" height="8" fill="#ffe59a" />
      <rect x="9" y="-25" width="8" height="8" fill="#ffe59a" />
    </g>
  )
}

function Castle({ x, y, s = 1, color = '#b9b4c7', windows = '#5b5470', flags = true }: { x: number; y: number; s?: number; color?: string; windows?: string; flags?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-60" y="-70" width="120" height="70" fill={color} />
      {[-60, -36, -12, 12, 36].map((bx) => (
        <rect key={bx} x={bx} y="-80" width="12" height="10" fill={color} />
      ))}
      {[-80, 60].map((tx) => (
        <g key={tx}>
          <rect x={tx} y="-110" width="20" height="110" fill={color} />
          <polygon points={`${tx - 4},-110 ${tx + 10},-140 ${tx + 24},-110`} fill="#d35454" />
          {flags && <polygon points={`${tx + 10},-140 ${tx + 10},-156 ${tx + 26},-148`} fill="#ffd32a" />}
          <rect x={tx + 6} y="-90" width="8" height="12" rx="4" fill={windows} />
        </g>
      ))}
      <path d="M-14 0 v-26 a14 14 0 0 1 28 0 v26 z" fill="#6b4b2a" />
      <rect x="-40" y="-55" width="10" height="14" rx="5" fill={windows} />
      <rect x="30" y="-55" width="10" height="14" rx="5" fill={windows} />
    </g>
  )
}

function Hills({ color, color2 }: { color: string; color2: string }) {
  return (
    <>
      <path d="M0 190 Q100 150 200 185 T400 175 V240 H0 Z" fill={color2} />
      <path d="M0 205 Q120 180 240 205 T400 200 V240 H0 Z" fill={color} />
    </>
  )
}

const SCENES: Record<SceneryId, () => React.ReactElement> = {
  village: () => (
    <>
      <Sky from="#7ec8f2" to="#d8f1ff" />
      <circle cx="340" cy="45" r="22" fill="#ffd32a" />
      <polygon points="120,190 210,40 300,190" fill="#8e8aa8" />
      <polygon points="182,88 210,40 238,88 224,80 210,92 196,80" fill="#fff" />
      <Hills color="#7bd36b" color2="#5fbf55" />
      <House x={70} y={208} wall="#ffd8a8" roof="#e17055" />
      <House x={330} y={204} wall="#fff1c1" roof="#6c5ce7" />
      <path d="M200 240 Q210 220 190 205" stroke="#e8c48a" strokeWidth="14" fill="none" />
    </>
  ),
  forest: () => (
    <>
      <Sky from="#3c6e57" to="#a7d7a0" />
      {[20, 80, 140, 260, 320, 380].map((x, i) => (
        <Tree key={x} x={x} y={175 + (i % 2) * 8} s={1.2} color="#2a6b3d" />
      ))}
      <rect y="195" width="400" height="45" fill="#4f8f3d" />
      <Tree x={300} y={215} s={2} color="#226b37" />
      {[40, 110, 190].map((x) => (
        <Tree key={x} x={x} y={225} s={1.4} />
      ))}
    </>
  ),
  bridge: () => (
    <>
      <Sky from="#8fd3ff" to="#e7f7ff" />
      <ellipse cx="80" cy="50" rx="30" ry="12" fill="#fff" />
      <ellipse cx="300" cy="35" rx="40" ry="14" fill="#fff" />
      <Hills color="#7bd36b" color2="#5fbf55" />
      <rect y="200" width="400" height="40" fill="#4aa3df" />
      <path d="M0 214 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#bfe6ff" strokeWidth="3" fill="none" />
      <path d="M70 205 Q220 140 370 205" stroke="#8b5a2b" strokeWidth="14" fill="none" />
      <path d="M70 188 Q220 123 370 188" stroke="#6b4b2a" strokeWidth="4" fill="none" />
      {[0.15, 0.3, 0.5, 0.7, 0.85].map((t) => {
        const x = 70 + 300 * t
        const y = 205 - 130 * t * (1 - t)
        return <line key={t} x1={x} y1={y} x2={x} y2={y - 17} stroke="#6b4b2a" strokeWidth="4" />
      })}
    </>
  ),
  cave: () => (
    <>
      <rect width="400" height="240" fill="#4b4560" />
      <path d="M0 0 H400 V240 H0 Z M60 240 Q60 60 200 50 Q340 60 340 240 Z" fill="#6d6688" fillRule="evenodd" />
      <path d="M60 240 Q60 60 200 50 Q340 60 340 240 Z" fill="#2d2840" />
      {[100, 150, 220, 280].map((x, i) => (
        <polygon key={x} points={`${x - 8},${62 + i * 3} ${x},${90 + (i % 2) * 15} ${x + 8},${62 + i * 3}`} fill="#6d6688" />
      ))}
      <rect x="0" y="0" width="40" height="240" fill="#6ec6ff" opacity="0.85" />
      {[8, 18, 30].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="240" stroke="#e3f6ff" strokeWidth="2" className="falling" />
      ))}
      <rect y="215" width="400" height="25" fill="#3a344f" />
      <g fill="#ffd32a" opacity="0.8">
        <circle cx="300" cy="215" r="6" />
        <circle cx="315" cy="217" r="5" />
        <circle cx="290" cy="219" r="4" />
      </g>
    </>
  ),
  castle: () => (
    <>
      <Sky from="#ffb4c8" to="#ffe9c9" />
      <Castle x={210} y={190} s={1.1} />
      <Hills color="#7bd36b" color2="#5fbf55" />
      <g>
        {Array.from({ length: 18 }, (_, i) => (
          <rect key={i} x={(i * 71) % 400} y={(i * 37) % 120} width="6" height="6" fill={['#ffd32a', '#54a0ff', '#e84393', '#2ecc71'][i % 4]} transform={`rotate(${i * 25} ${(i * 71) % 400} ${(i * 37) % 120})`} className="confetti" />
        ))}
      </g>
    </>
  ),
  school: () => (
    <>
      <Sky from="#1e1b4b" to="#5b4b9a" />
      <Stars />
      <circle cx="330" cy="45" r="20" fill="#fff3c4" />
      <circle cx="338" cy="40" r="17" fill="#2a2560" />
      <Castle x={200} y={200} s={1.1} color="#8a7cc4" windows="#ffd32a" flags={false} />
      <path d="M0 205 Q200 185 400 205 V240 H0 Z" fill="#2c5e3f" />
    </>
  ),
  lab: () => (
    <>
      <rect width="400" height="240" fill="#5a4e6e" />
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={(i % 8) * 50 + (Math.floor(i / 8) % 2) * 25 - 25} y={Math.floor(i / 8) * 30} width="48" height="28" fill="#655a7c" />
      ))}
      <rect x="20" y="70" width="140" height="6" fill="#7a4b2a" />
      <rect x="250" y="55" width="130" height="6" fill="#7a4b2a" />
      {[['#2ecc71', 35], ['#e84393', 65], ['#54a0ff', 95], ['#ffd32a', 130]].map(([c, x]) => (
        <g key={x as number}>
          <rect x={(x as number) - 7} y="48" width="14" height="22" rx="4" fill={c as string} />
          <rect x={(x as number) - 3} y="42" width="6" height="7" fill="#d9d4e6" />
        </g>
      ))}
      {[['#a55eea', 270], ['#ff9f43', 305], ['#20bf6b', 345]].map(([c, x]) => (
        <circle key={x as number} cx={x as number} cy="44" r="10" fill={c as string} />
      ))}
      <rect y="210" width="400" height="30" fill="#a07850" />
      <ellipse cx="200" cy="215" rx="38" ry="8" fill="#ff7b2e" className="flicker" />
      <path d="M150 170 Q150 215 200 215 Q250 215 250 170 Z" fill="#2d2a32" />
      <ellipse cx="200" cy="170" rx="50" ry="10" fill="#7bed9f" />
      {[180, 205, 222].map((x, i) => (
        <circle key={x} cx={x} cy={160 - i * 6} r={5 - i} fill="#7bed9f" className="bubble" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </>
  ),
  sky: () => (
    <>
      <Sky from="#141236" to="#3f3a87" />
      <Stars />
      <circle cx="80" cy="50" r="26" fill="#fff3c4" />
      <ellipse cx="260" cy="90" rx="50" ry="12" fill="#6d68b0" opacity="0.6" />
      <ellipse cx="120" cy="140" rx="40" ry="10" fill="#6d68b0" opacity="0.5" />
      <path d="M0 240 V215 H30 V200 L45 185 L60 200 V210 H90 V195 H120 V215 H150 V190 L170 170 L190 190 V215 H230 V200 H260 V185 L275 170 L290 185 V215 H330 V205 H360 V195 H400 V240 Z" fill="#0d0b26" />
      {[50, 105, 175, 245, 280, 345].map((x) => (
        <rect key={x} x={x} y="210" width="5" height="6" fill="#ffd32a" />
      ))}
    </>
  ),
  tower: () => (
    <>
      <Sky from="#1b1846" to="#57489a" />
      <Stars />
      <circle cx="60" cy="50" r="18" fill="#fff3c4" />
      <rect x="250" y="80" width="70" height="160" fill="#3d3566" />
      <polygon points="240,80 285,10 330,80" fill="#a29bfe" />
      <rect x="272" y="110" width="14" height="22" rx="7" fill="#ffd32a" />
      <rect x="272" y="170" width="14" height="22" rx="7" fill="#ffd32a" />
      <rect x="240" y="76" width="90" height="8" fill="#2c2550" />
      <path d="M0 225 Q200 205 400 225 V240 H0 Z" fill="#2c5e3f" />
    </>
  ),
}

export function Scenery({ id }: { id: SceneryId }) {
  const Draw = SCENES[id]
  return (
    <svg className="scenery" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Draw />
    </svg>
  )
}
