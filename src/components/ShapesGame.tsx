import { useEffect, useMemo, useRef, useState, type SVGProps } from 'react'
import { PICTURES, SHAPES, SHAPE_IDS, type Picture, type Piece, type ShapeId } from '../data/shapes'
import { playCorrect, playWrong, speak } from '../audio'
import { pickFresh, shuffle } from '../utils'
import { GameFrame } from './GameFrame'
import { LEVEL_MULTIPLIER } from '../rewards'

// "Costruisci con le forme": a picture (house, rocket, car…) waits as grey outlines. The child
// hears "Find the triangle!" and taps the triangle in the tray below; it pops into the picture.
// The outlines don't say which piece is asked for, so the name is what counts. When every piece
// is in place the picture comes alive (the rocket takes off, the car drives away). A star for
// each picture built without mistakes.

const ROUNDS = 5
const TRAY = 4

const PROMPTS = ['Find the {s}!', 'Where is the {s}?', 'Now the {s}!', 'Can you find the {s}?', 'Tap the {s}!']
const PRAISE = ['Yes!', 'Great!', 'Well done!', 'Super!', 'Good job!']
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

const withA = (s: ShapeId) => (s === 'oval' ? `an ${s}` : `a ${s}`)

// Draws one shape centred on (x, y), w wide and h tall.
export function Shape({ shape, x, y, w, h = w, rot = 0, ...rest }: Omit<Piece, 'color'> & SVGProps<SVGElement>) {
  const transform = rot ? `rotate(${rot} ${x} ${y})` : undefined
  const props = { ...rest, transform } as SVGProps<SVGElement>
  const l = x - w / 2, r = x + w / 2, t = y - h / 2, b = y + h / 2
  switch (shape) {
    case 'circle':
      return <ellipse cx={x} cy={y} rx={w / 2} ry={w / 2} {...(props as SVGProps<SVGEllipseElement>)} />
    case 'oval':
      return <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} {...(props as SVGProps<SVGEllipseElement>)} />
    case 'square':
      return <rect x={l} y={y - w / 2} width={w} height={w} rx={3} {...(props as SVGProps<SVGRectElement>)} />
    case 'rectangle':
      return <rect x={l} y={t} width={w} height={h} rx={3} {...(props as SVGProps<SVGRectElement>)} />
    case 'triangle':
      return <polygon points={`${x},${t} ${r},${b} ${l},${b}`} strokeLinejoin="round" {...(props as SVGProps<SVGPolygonElement>)} />
    case 'diamond':
      return <polygon points={`${x},${t} ${r},${y} ${x},${b} ${l},${y}`} strokeLinejoin="round" {...(props as SVGProps<SVGPolygonElement>)} />
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const radius = (i % 2 ? 0.42 : 1) * (w / 2)
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        return `${(x + radius * Math.cos(a)).toFixed(1)},${(y + 4 + radius * Math.sin(a)).toFixed(1)}`
      })
      return <polygon points={pts.join(' ')} strokeLinejoin="round" {...(props as SVGProps<SVGPolygonElement>)} />
    }
    case 'heart': {
      const d = 'M0 0.9 C-0.2 0.75 -1 0.3 -1 -0.3 C-1 -0.75 -0.55 -1 -0.3 -0.95 C-0.12 -0.92 0 -0.75 0 -0.6 C0 -0.75 0.12 -0.92 0.3 -0.95 C0.55 -1 1 -0.75 1 -0.3 C1 0.3 0.2 0.75 0 0.9 Z'
      const tr = `translate(${x} ${y}) ${rot ? `rotate(${rot})` : ''} scale(${w / 2} ${h / 2})`
      return <path d={d} vectorEffect="non-scaling-stroke" {...(props as SVGProps<SVGPathElement>)} transform={tr} />
    }
  }
}

// Size of each shape when shown alone on a tray button (100×100 box).
const TRAY_SIZE: Record<ShapeId, { w: number; h?: number }> = {
  circle: { w: 70 }, square: { w: 64 }, triangle: { w: 78, h: 68 }, rectangle: { w: 80, h: 46 },
  star: { w: 82 }, heart: { w: 74, h: 68 }, oval: { w: 82, h: 54 }, diamond: { w: 58, h: 80 },
}

function ShapeIcon({ shape }: { shape: ShapeId }) {
  return (
    <svg viewBox="0 0 100 100" className="shape-icon" aria-hidden="true">
      <Shape shape={shape} x={50} y={50} {...TRAY_SIZE[shape]} fill={SHAPES[shape].color} stroke="rgba(0,0,0,.25)" strokeWidth={3} />
    </svg>
  )
}

// Speaks once the voice is free, so a new sentence never cuts off the previous one.
function whenQuiet(fn: () => void, timers: number[], wait = 0) {
  const started = Date.now()
  const tick = () => {
    const talking = window.speechSynthesis?.speaking || window.speechSynthesis?.pending
    if (talking && Date.now() - started < 8000) timers.push(window.setTimeout(tick, 150))
    else fn()
  }
  timers.push(window.setTimeout(tick, wait))
}

function BuildPicture({ picture, onDone }: { picture: Picture; onDone: (firstTry: boolean) => void }) {
  // Pieces are asked for in the order they are listed: big background pieces first, so the picture grows naturally.
  const order = picture.pieces.map((_, i) => i)
  const [placed, setPlaced] = useState(0)
  const [wrong, setWrong] = useState<ShapeId[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [busy, setBusy] = useState(false)
  const [justPlaced, setJustPlaced] = useState<number | null>(null)
  const timers = useRef<number[]>([])
  const complete = placed >= order.length
  const asked = complete ? null : picture.pieces[order[placed]].shape
  const prompt = useMemo(() => (asked ? pick(PROMPTS).replace('{s}', asked) : ''), [placed]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // The tray: the asked shape plus others still needed, topped up with other shapes, in a new order.
  const tray = useMemo(() => {
    if (!asked) return []
    const needed = [...new Set(order.slice(placed + 1).map((i) => picture.pieces[i].shape))].filter((s) => s !== asked)
    const others = shuffle(SHAPE_IDS.filter((s) => s !== asked && !needed.includes(s)))
    return shuffle([asked, ...shuffle(needed), ...others].slice(0, TRAY))
  }, [placed]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!asked) return
    whenQuiet(() => speak(prompt), timers.current, placed === 0 ? 500 : 300)
  }, [placed]) // eslint-disable-line react-hooks/exhaustive-deps

  function choose(shape: ShapeId) {
    if (busy || !asked) return
    if (shape !== asked) {
      playWrong()
      setMistakes((m) => m + 1)
      setWrong((w) => [...w, shape])
      timers.current.push(window.setTimeout(() => speak(`That's ${withA(shape)}. ${prompt}`), 350))
      return
    }
    playCorrect()
    setBusy(true)
    setJustPlaced(order[placed])
    timers.current.push(window.setTimeout(() => speak(`${pick(PRAISE)} ${withA(shape)[0].toUpperCase()}${withA(shape).slice(1)}!`), 350))
    const last = placed + 1 >= order.length
    whenQuiet(() => {
      setWrong([])
      setPlaced((p) => p + 1)
      setBusy(false)
      if (last) {
        speak(`Hooray! It's ${picture.en}!`)
        onDone(mistakes === 0)
      }
    }, timers.current, 900)
  }

  const say = () => (asked ? speak(prompt) : speak(`It's ${picture.en}!`))

  return (
    <div className="shapes">
      <div className="question">
        <button className="speaker" onClick={say} aria-label="Ascolta di nuovo">🔊</button>
        <p className="hint">{complete ? ' ' : 'Ascolta e tocca la forma giusta!'}</p>
      </div>
      <svg viewBox="0 0 200 200" className="shape-picture" role="img" aria-label={complete ? picture.en : 'Immagine da costruire'}>
        {picture.deco}
        <g className={complete ? `finish-${picture.finish}` : ''}>
          {picture.pieces.map((p, i) => {
            const done = order.indexOf(i) < placed || i === justPlaced
            return (
              <g key={i} className={i === justPlaced && !complete ? 'piece-in' : ''}>
              <Shape
                shape={p.shape} x={p.x} y={p.y} w={p.w} h={p.h} rot={p.rot}
                fill={done ? p.color : '#ece7dd'}
                stroke={done ? 'rgba(0,0,0,.3)' : '#b9b1a3'}
                strokeWidth={done ? 2 : 2.5}
                strokeDasharray={done ? undefined : '6 5'}
                onClick={done ? () => speak(p.shape) : undefined}
              />
              </g>
            )
          })}
        </g>
      </svg>
      <p className="answer">
        {complete ? `${picture.en} = ${picture.it}` : justPlaced !== null && busy ? `${picture.pieces[justPlaced].shape} = ${SHAPES[picture.pieces[justPlaced].shape].it}` : ' '}
      </p>
      <div className="shape-tray">
        {tray.map((s) => {
          const isWrong = wrong.includes(s)
          return (
            <button key={`${placed}-${s}`} className={`card shape-card ${isWrong ? 'shake faded' : ''}`} onClick={() => choose(s)} disabled={isWrong || complete} aria-label={s}>
              <ShapeIcon shape={s} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ShapesGame({ onBack, onFinish }: { onBack: () => void; onFinish: (stars: number) => void }) {
  // Smaller pictures first, so each game starts easy and ends with the big builds.
  const pictures = useMemo(
    () => pickFresh('game:shapes', PICTURES, ROUNDS, (p) => p.id).sort((a, b) => a.pieces.length - b.pieces.length),
    [],
  )
  return (
    <GameFrame total={pictures.length} onBack={onBack} onFinish={onFinish} multiplier={LEVEL_MULTIPLIER['1']} delay={2600}>
      {(i, done) => <BuildPicture picture={pictures[i]} onDone={done} />}
    </GameFrame>
  )
}
