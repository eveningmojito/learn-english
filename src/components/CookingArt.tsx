import { useId, type ReactNode } from 'react'
import { COLORS, INGREDIENTS, type DeviceId, type Dish, type Scene, type ToolId } from '../data/cooking'

// Drawings for the cooking game: the dish in each of its stages, the kitchen tools and devices.
// Dishes are drawn in a 200×200 box, tools and devices in a 100×100 box.

const DOUGH = '#f1d9a6'
const BATTER = '#f7d775'
const GOLDEN = '#d99a3e'

const Emoji = ({ id, x, y, size = 24, opacity }: { id: string; x: number; y: number; size?: number; opacity?: number }) => (
  <text x={x} y={y} fontSize={size} textAnchor="middle" dominantBaseline="central" opacity={opacity}>
    {INGREDIENTS[id]?.emoji}
  </text>
)

// Where toppings may sit on each dish, so a drop near the edge still lands on the food.
export function clampTopping(scene: Scene, x: number, y: number, d: Pick<Dish, 'p'>): [number, number] {
  const clamp = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)))
  if (scene === 'pizza' || scene === 'plate') {
    const cx = 100, cy = scene === 'pizza' ? 100 : 98
    const r = scene === 'pizza' ? (30 + 55 * (d.p.roll ?? 1)) - 16 : 50
    const dx = x - cx, dy = (y - cy) * (scene === 'plate' ? 2 : 1)
    const len = Math.hypot(dx, dy)
    const k = len > r ? r / len : 1
    return [Math.round(cx + dx * k), Math.round(cy + (dy * k) / (scene === 'plate' ? 2 : 1))]
  }
  if (scene === 'cake') return [clamp(x, 45, 155), clamp(y, 62, 150)]
  if (scene === 'glass') return [clamp(x, 52, 150), clamp(y, 30, 165)]
  return [clamp(x, 20, 180), clamp(y, 20, 180)]
}

function Layer({ id, y }: { id: string; y: number }) {
  switch (id) {
    case 'cheese':
      return <path d={`M32 ${y} H168 V${y + 9} H120 L112 ${y + 18} L104 ${y + 9} H32 Z`} fill="#ffd43b" stroke="#e1b12c" strokeWidth={1.5} />
    case 'tomato':
      return <g>{[50, 82, 114, 146].map((x) => <ellipse key={x} cx={x} cy={y + 5} rx={17} ry={6} fill="#e8432e" stroke="#c0392b" strokeWidth={1.5} />)}</g>
    case 'lettuce':
      return <path d={`M26 ${y + 8} q8 -12 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 V${y + 12} H26 Z`} fill="#6abe45" stroke="#4a9a2a" strokeWidth={1.5} />
    case 'ham':
      return <rect x={30} y={y} width={140} height={10} rx={5} fill="#f4a3a8" stroke="#d98088" strokeWidth={1.5} />
    case 'cucumber':
      return <g>{[48, 80, 112, 144].map((x) => <ellipse key={x} cx={x} cy={y + 5} rx={15} ry={5.5} fill="#9ad16b" stroke="#4a8a2a" strokeWidth={2} />)}</g>
    case 'egg':
      return <g><rect x={36} y={y} width={128} height={10} rx={5} fill="#fffaf0" stroke="#ddd" /><ellipse cx={100} cy={y + 5} rx={20} ry={5} fill="#ffc312" /></g>
    default:
      return <rect x={30} y={y} width={140} height={10} rx={5} fill={INGREDIENTS[id]?.color ?? '#ccc'} />
  }
}

function Sandwich({ d, clip }: { d: Partial<Dish>; clip: string }) {
  const bread = d.cooked ? '#d9934a' : '#f2d29b'
  const layers = d.layers ?? []
  let y = 134
  const parts: ReactNode[] = []
  if (d.p?.butter) parts.push(<rect key="butter" x={32} y={133} width={136 * Math.min(1, d.p.butter)} height={6} rx={3} fill="#ffe59a" />)
  layers.forEach((l, i) => {
    y -= 12
    parts.push(<Layer key={i} id={l} y={y} />)
  })
  const top = d.top ? (
    <path key="top" d={`M28 ${y - 2} V${y - 14} Q28 ${y - 44} 100 ${y - 44} Q172 ${y - 44} 172 ${y - 14} V${y - 2} Z`} fill={bread} stroke="#b8763a" strokeWidth={3} />
  ) : null
  const body = (
    <g>
      <rect x={28} y={138} width={144} height={26} rx={10} fill={bread} stroke="#b8763a" strokeWidth={3} />
      {parts}
      {top}
    </g>
  )
  return (
    <>
      <ellipse cx={100} cy={170} rx={92} ry={14} fill="#fff" stroke="#dcdde1" strokeWidth={2} />
      {d.cut ? (
        <>
          <clipPath id={`${clip}l`}><rect x={0} y={0} width={100} height={200} /></clipPath>
          <clipPath id={`${clip}r`}><rect x={100} y={0} width={100} height={200} /></clipPath>
          <g clipPath={`url(#${clip}l)`} transform="translate(-7 0) rotate(-3 100 160)">{body}</g>
          <g clipPath={`url(#${clip}r)`} transform="translate(7 0) rotate(3 100 160)">{body}</g>
        </>
      ) : (
        body
      )}
    </>
  )
}

// The dish in its current stage. `inside` ingredients float in the bowl or blender until mixed.
export function DishView({ dish, className = 'dish', spin }: { dish: Partial<Dish> & { scene: Scene }; className?: string; spin?: boolean }) {
  const clip = useId().replace(/:/g, '')
  const d = dish
  const p = d.p ?? {}
  const inside = d.inside ?? []
  const toppings = d.toppings ?? []
  const layers = d.layers ?? []
  const mixP = d.mix ? (p.mix ?? 1) : 0
  let body: ReactNode = null

  switch (d.scene) {
    case 'bowl':
      body = (
        <>
          <ellipse cx={100} cy={88} rx={80} ry={20} fill="#4a9cc0" />
          {d.mix && <ellipse cx={100} cy={92} rx={70} ry={14} fill={d.mix} opacity={mixP} />}
          <g className={spin ? 'stir' : ''}>
            {inside.map((id, i) => (
              <Emoji key={i} id={id} x={100 + (i - (inside.length - 1) / 2) * 36} y={74 + (i % 2) * 10} size={44} opacity={1 - mixP} />
            ))}
          </g>
          <path d="M20 88 Q24 172 100 174 Q176 172 180 88 Z" fill="#7ec8e3" stroke="#4a9cc0" strokeWidth={3} />
          <path d="M40 112 Q60 150 100 156" stroke="#fff" strokeOpacity={0.5} strokeWidth={6} fill="none" strokeLinecap="round" />
        </>
      )
      break
    case 'pizza': {
      const r = 30 + 55 * (p.roll ?? (layers.length ? 1 : 0))
      const sauce = d.cooked ? '#c0321c' : '#e0452b'
      body = (
        <>
          <ellipse cx={100} cy={106} rx={r + 4} ry={r + 2} fill="rgba(0,0,0,.12)" />
          <circle cx={100} cy={100} r={r} fill={d.cooked ? '#dfa257' : (d.mix ?? DOUGH)} stroke={d.cooked ? '#b97a35' : '#e2c48a'} strokeWidth={3} />
          {layers.includes('tomato') && <circle cx={100} cy={100} r={r - 10} fill={sauce} />}
          {layers.includes('cheese') &&
            [[0, 0], [-0.45, -0.3], [0.4, -0.35], [-0.4, 0.4], [0.45, 0.35], [0, -0.6], [0, 0.6], [-0.65, 0], [0.65, 0]].map(([dx, dy], i) => (
              <circle key={i} cx={100 + dx * r} cy={100 + dy * r} r={r * 0.2} fill={d.cooked ? '#ffcf4d' : '#fff1b8'} stroke={d.cooked ? '#e1a325' : 'none'} strokeWidth={1} />
            ))}
        </>
      )
      break
    }
    case 'tin':
      body = (
        <>
          <path d="M34 100 L44 160 H156 L166 100 Z" fill="#b2bec3" stroke="#808e9b" strokeWidth={3} />
          <ellipse cx={100} cy={100} rx={66} ry={14} fill="#dfe6e9" stroke="#808e9b" strokeWidth={3} />
          {d.mix && <ellipse cx={100} cy={104} rx={58} ry={10} fill={d.mix} />}
        </>
      )
      break
    case 'cake': {
      const icing = d.color ? COLORS[d.color]?.color : undefined
      const cover = icing ? Math.min(1, p.icing ?? 0) : 0
      body = (
        <>
          <ellipse cx={100} cy={166} rx={90} ry={16} fill="#fff" stroke="#dcdde1" strokeWidth={2} />
          <rect x={35} y={84} width={130} height={76} rx={10} fill="#e8b56a" stroke="#c98d3f" strokeWidth={3} />
          <rect x={35} y={118} width={130} height={8} fill="#fff4dc" />
          <ellipse cx={100} cy={84} rx={65} ry={16} fill="#f0c27a" stroke="#c98d3f" strokeWidth={3} />
          {cover > 0 && (
            <>
              <clipPath id={clip}><rect x={30} y={0} width={140 * cover} height={200} /></clipPath>
              <g clipPath={`url(#${clip})`}>
                <ellipse cx={100} cy={84} rx={67} ry={18} fill={icing} />
                <path d="M33 86 V104 q6 10 12 0 V96 q6 14 12 0 V100 q6 12 12 0 V94 q6 16 12 0 V100 q6 10 12 0 V96 q6 14 12 0 V102 q6 10 12 0 V94 q6 14 12 0 V100 q6 10 12 0 V96 q6 12 12 0 V86 Z" fill={icing} />
              </g>
            </>
          )}
        </>
      )
      break
    }
    case 'blender': {
      const shown = inside.slice(-8)
      body = (
        <>
          <path d="M52 22 H148 L136 140 H64 Z" fill="#eaf6ff" stroke="#8fb9d1" strokeWidth={3} />
          {d.mix && <path d="M58 60 H142 L136 136 H64 Z" fill={d.mix} opacity={mixP} />}
          <clipPath id={clip}><path d="M52 22 H148 L136 140 H64 Z" /></clipPath>
          <g clipPath={`url(#${clip})`}>
          <g className={spin ? 'spin' : ''} style={{ transformOrigin: '100px 100px' }}>
            {shown.map((id, i) => (
              <Emoji key={i} id={id} x={84 + (i % 2) * 32} y={124 - Math.floor(i / 2) * 26} size={28} opacity={1 - mixP} />
            ))}
          </g>
          </g>
          <rect x={48} y={14} width={104} height={12} rx={4} fill="#636e72" />
          <path d="M64 140 H136 L146 182 H54 Z" fill="#636e72" />
          <circle cx={100} cy={162} r={9} fill={spin ? '#2ecc71' : '#ff6b6b'} />
        </>
      )
      break
    }
    case 'glass':
      body = (
        <>
          <path d="M58 40 H142 L130 178 H70 Z" fill="#eef8ff" stroke="#9cc6dc" strokeWidth={3} />
          {d.mix && <path d="M62 62 H138 L128 174 H72 Z" fill={d.mix} />}
          <path d="M112 66 L150 10" stroke="#ff6b6b" strokeWidth={7} strokeLinecap="round" />
          <path d="M74 70 L82 160" stroke="#fff" strokeOpacity={0.5} strokeWidth={5} strokeLinecap="round" />
        </>
      )
      break
    case 'pan':
      body = (
        <>
          <rect x={150} y={94} width={48} height={14} rx={6} fill="#2d3436" />
          <circle cx={100} cy={100} r={72} fill="#2d3436" />
          <circle cx={100} cy={100} r={63} fill="#57606f" />
          {layers.includes('batter') && (
            <g className={spin ? 'flip' : ''} style={{ transformOrigin: '100px 100px' }}>
              <circle cx={100} cy={100} r={48} fill={d.cooked ? GOLDEN : (d.mix ?? BATTER)} stroke={d.cooked ? '#b87a2a' : 'none'} strokeWidth={2} />
              {d.cooked && <circle cx={88} cy={90} r={14} fill="#c98a30" opacity={0.5} />}
            </g>
          )}
        </>
      )
      break
    case 'plate':
      body = (
        <>
          <ellipse cx={100} cy={128} rx={92} ry={44} fill="#fff" stroke="#dcdde1" strokeWidth={3} />
          <ellipse cx={100} cy={128} rx={66} ry={30} fill="none" stroke="#f1f2f6" strokeWidth={3} />
          {d.cooked && [0, 1, 2].map((i) => (
            <g key={i}>
              <ellipse cx={100} cy={130 - i * 14} rx={62} ry={22} fill="#b87a2a" />
              <ellipse cx={100} cy={126 - i * 14} rx={62} ry={22} fill={GOLDEN} />
            </g>
          ))}
        </>
      )
      break
    case 'sandwich':
      body = <Sandwich d={d} clip={clip} />
      break
  }

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-hidden="true">
      {body}
      {toppings.map(([id, x, y], i) => (
        <Emoji key={i} id={id} x={x} y={y} size={d.scene === 'glass' ? 26 : 24} />
      ))}
    </svg>
  )
}

// Kitchen tools, drawn on a slant like on a kitchen rack.
export function ToolIcon({ tool, className = 'tool-icon' }: { tool: ToolId; className?: string }) {
  const parts: Record<ToolId, ReactNode> = {
    knife: (
      <>
        <path d="M50 8 Q62 30 58 62 H44 Q40 30 50 8 Z" fill="#dfe6e9" stroke="#808e9b" strokeWidth={2.5} />
        <rect x={43} y={62} width={16} height={32} rx={5} fill="#8e5b3c" />
      </>
    ),
    spoon: (
      <>
        <ellipse cx={50} cy={24} rx={14} ry={19} fill="#dfe6e9" stroke="#808e9b" strokeWidth={2.5} />
        <rect x={46} y={42} width={8} height={52} rx={4} fill="#b2bec3" stroke="#808e9b" strokeWidth={2} />
      </>
    ),
    whisk: (
      <>
        {[8, 14, 20].map((rx) => <ellipse key={rx} cx={50} cy={32} rx={rx} ry={26} fill="none" stroke="#808e9b" strokeWidth={2.5} />)}
        <rect x={45} y={56} width={10} height={38} rx={5} fill="#ff6b6b" />
      </>
    ),
    rollingpin: (
      <>
        <rect x={38} y={18} width={24} height={64} rx={10} fill="#e0b073" stroke="#a9773a" strokeWidth={2.5} />
        <rect x={45} y={2} width={10} height={18} rx={4} fill="#c98d4f" />
        <rect x={45} y={80} width={10} height={18} rx={4} fill="#c98d4f" />
      </>
    ),
    spatula: (
      <>
        <rect x={34} y={6} width={32} height={34} rx={6} fill="#636e72" />
        {[42, 50, 58].map((x) => <rect key={x} x={x - 1.5} y={12} width={3} height={22} rx={1.5} fill="#b2bec3" />)}
        <rect x={46} y={38} width={8} height={56} rx={4} fill="#2d3436" />
      </>
    ),
    fork: (
      <>
        {[40, 47, 53, 60].map((x) => <rect key={x} x={x - 1.5} y={6} width={3} height={24} rx={1.5} fill="#b2bec3" />)}
        <path d="M38 28 H62 Q62 42 50 44 Q38 42 38 28 Z" fill="#b2bec3" />
        <rect x={46} y={42} width={8} height={52} rx={4} fill="#b2bec3" stroke="#808e9b" strokeWidth={2} />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g transform="rotate(35 50 50)">{parts[tool]}</g>
    </svg>
  )
}

// Where the dish sits inside each device once put in (as % of the device box) and where its ON button is.
export const DEVICE_SPOTS: Record<DeviceId, { dish: [number, number, number]; button: [number, number] }> = {
  oven: { dish: [27, 38, 46], button: [78, 13] },
  cooker: { dish: [30, 2, 40], button: [80, 76] },
  toaster: { dish: [26, 2, 48], button: [84, 52] },
  microwave: { dish: [17, 30, 44], button: [80, 60] },
  blender: { dish: [25, 5, 50], button: [50, 84] },
}

export function DeviceArt({ device, on, className = 'device-icon' }: { device: DeviceId; on?: boolean; className?: string }) {
  const glow = on ? '#ff9f43' : '#2d3436'
  const parts: Record<DeviceId, ReactNode> = {
    oven: (
      <>
        <rect x={10} y={6} width={80} height={88} rx={8} fill="#dfe6e9" stroke="#808e9b" strokeWidth={2.5} />
        <rect x={10} y={6} width={80} height={16} rx={8} fill="#b2bec3" />
        {[24, 38, 52].map((x) => <circle key={x} cx={x} cy={14} r={4} fill="#636e72" />)}
        <rect x={20} y={32} width={60} height={46} rx={6} fill={glow} opacity={on ? 0.85 : 1} />
        <rect x={26} y={26} width={48} height={4} rx={2} fill="#636e72" />
      </>
    ),
    cooker: (
      <>
        <rect x={8} y={40} width={84} height={54} rx={6} fill="#dfe6e9" stroke="#808e9b" strokeWidth={2.5} />
        <path d="M8 40 L20 24 H80 L92 40 Z" fill="#b2bec3" stroke="#808e9b" strokeWidth={2.5} />
        <ellipse cx={38} cy={31} rx={10} ry={4} fill={on ? '#ff6b3d' : '#2d3436'} />
        <ellipse cx={64} cy={31} rx={10} ry={4} fill={on ? '#ff6b3d' : '#2d3436'} />
        <rect x={18} y={52} width={46} height={34} rx={4} fill="#2d3436" />
      </>
    ),
    toaster: (
      <>
        <rect x={12} y={30} width={74} height={58} rx={18} fill="#b2bec3" stroke="#808e9b" strokeWidth={2.5} />
        <rect x={26} y={30} width={18} height={6} rx={3} fill="#2d3436" />
        <rect x={52} y={30} width={18} height={6} rx={3} fill="#2d3436" />
        <rect x={86} y={44} width={8} height={18} rx={3} fill="#636e72" />
        <rect x={22} y={78} width={54} height={4} rx={2} fill={on ? '#ff6b3d' : '#808e9b'} />
      </>
    ),
    microwave: (
      <>
        <rect x={6} y={22} width={88} height={60} rx={6} fill="#dfe6e9" stroke="#808e9b" strokeWidth={2.5} />
        <rect x={12} y={28} width={56} height={48} rx={4} fill={on ? '#ffeaa7' : '#2d3436'} />
        {[34, 44, 54].map((y) => <rect key={y} x={74} y={y} width={14} height={5} rx={2} fill="#636e72" />)}
      </>
    ),
    blender: (
      <>
        <path d="M30 10 H70 L64 64 H36 Z" fill="#eaf6ff" stroke="#8fb9d1" strokeWidth={2.5} />
        <path d="M36 64 H64 L70 92 H30 Z" fill="#636e72" />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {parts[device]}
    </svg>
  )
}

export function FridgeArt({ open, className = 'fridge-art' }: { open?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden="true">
      <rect x={14} y={4} width={72} height={132} rx={10} fill="#e8f4fb" stroke="#8fb9d1" strokeWidth={3} />
      {open ? (
        <>
          <rect x={20} y={10} width={60} height={120} rx={6} fill="#cfe9f7" />
          {[44, 76, 108].map((y) => <rect key={y} x={20} y={y} width={60} height={3} fill="#9cc6dc" />)}
        </>
      ) : (
        <>
          <line x1={14} y1={50} x2={86} y2={50} stroke="#8fb9d1" strokeWidth={3} />
          <rect x={72} y={18} width={5} height={22} rx={2.5} fill="#8fb9d1" />
          <rect x={72} y={62} width={5} height={34} rx={2.5} fill="#8fb9d1" />
          <text x={42} y={30} fontSize={16} textAnchor="middle" dominantBaseline="central">❄️</text>
        </>
      )}
    </svg>
  )
}

// An ingredient as a picture: a paper bag for flour and sugar, cut in two once chopped.
export function IngredientIcon({ id, chopped }: { id: string; chopped?: boolean }) {
  const ing = INGREDIENTS[id]
  if (ing.bag)
    return (
      <span className="ing bag" style={{ background: ing.color }}>
        <span>{ing.emoji}</span>
      </span>
    )
  if (chopped)
    return (
      <span className="ing halves">
        <span>{ing.emoji}</span>
        <span>{ing.emoji}</span>
      </span>
    )
  return <span className="ing">{ing.emoji}</span>
}
