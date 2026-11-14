import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import {
  COLORS,
  DEVICE_IDS,
  DEVICES,
  DISTRACTORS,
  INGREDIENTS,
  RECIPES,
  TOOL_IDS,
  TOOLS,
  describe,
  newDish,
  the,
  type Dish,
  type Recipe,
  type Scene,
  type Step,
  type Text,
} from '../data/cooking'
import { playBubble, playChop, playCorrect, playDing, playPop, playSwish, playWrong, speak, whenQuiet } from '../audio'
import { addToFridge, loadFridge } from '../fridge'
import { LEVEL_MULTIPLIER } from '../rewards'
import { shuffle } from '../utils'
import { GameFrame } from './GameFrame'
import { DEVICE_SPOTS, DeviceArt, DishView, FridgeArt, IngredientIcon, ToolIcon, clampTopping } from './CookingArt'

// "In cucina" (level 3–4): the child picks a recipe and cooks it step by step, guided in English.
// Find the ingredients by name, drag them into the bowl, pick the right tool and use it
// (mix, roll, spread, cut, flip), put the dish in the right device and switch it on. Some steps
// are the child's own choices: toppings, icing colour, fruit, sandwich fillings. The finished
// dish goes into the fridge in the child's house. A star for each step done without mistakes.

const PRAISE = ['Yes!', 'Great!', 'Well done!', 'Super!', 'Good job!']
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

type StepProps = { dish: Dish; setDish: (f: (d: Dish) => Dish) => void; done: (firstTry: boolean) => void }

function useTimers() {
  const [timers] = useState<number[]>(() => [])
  useEffect(() => () => timers.forEach(clearTimeout), [timers])
  return timers
}

const inside = (el: Element | null, x: number, y: number, pad = 16) => {
  if (!el) return false
  const r = el.getBoundingClientRect()
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad
}

// Something the child can pick up and drag. A short tap without moving calls onTap instead.
function Draggable({ onDrop, onTap, children, className = '', label }: { onDrop: (x: number, y: number) => boolean; onTap?: () => void; children: ReactNode; className?: string; label: string }) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const [off, setOff] = useState<[number, number] | null>(null)
  return (
    <div
      className={`drag ${className} ${off ? 'dragging' : ''}`}
      style={off ? { transform: `translate(${off[0]}px, ${off[1]}px) scale(1.1)` } : undefined}
      role="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        start.current = { x: e.clientX, y: e.clientY }
        setOff([0, 0])
      }}
      onPointerMove={(e) => {
        if (start.current) setOff([e.clientX - start.current.x, e.clientY - start.current.y])
      }}
      onPointerUp={(e) => {
        const s = start.current
        if (!s) return
        start.current = null
        setOff(null)
        if (Math.hypot(e.clientX - s.x, e.clientY - s.y) < 10) onTap?.()
        else onDrop(e.clientX, e.clientY)
      }}
      onPointerCancel={() => {
        start.current = null
        setOff(null)
      }}
    >
      {children}
    </div>
  )
}

// The English instruction, spoken whenever it changes, with an Italian translation on request.
// Praise shown once a step is done is not spoken again: the step already said it.
function Instruction({ text, timers, hint, silent }: { text: Text; timers: number[]; hint?: string; silent?: boolean }) {
  const [showIt, setShowIt] = useState(false)
  useEffect(() => {
    if (!silent) whenQuiet(() => speak(text.en), timers, 350)
  }, [text.en]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="cook-say">
      <button className="cook-say-text" onClick={() => speak(text.en)}>
        <span>🔊 {text.en}</span>
        {showIt && <span className="bubble-it">{text.it}</span>}
        {hint && <span className="cook-hint">{hint}</span>}
      </button>
      <button className="it-toggle" onClick={() => setShowIt(!showIt)} aria-label="Traduzione in italiano">🇮🇹</button>
    </div>
  )
}

function Counter({ dish, drag, onDrop }: { dish: Dish; drag?: boolean; onDrop?: (id: string, x: number, y: number) => boolean }) {
  if (!dish.counter.length) return <div className="counter empty" />
  return (
    <div className="counter">
      {dish.counter.map((id) =>
        drag && onDrop ? (
          <Draggable key={id} className="counter-item" label={INGREDIENTS[id].en} onDrop={(x, y) => onDrop(id, x, y)} onTap={() => speak(INGREDIENTS[id].en)}>
            <IngredientIcon id={id} chopped={dish.chopped.includes(id)} />
          </Draggable>
        ) : (
          <button key={id} className="counter-item" onClick={() => speak(INGREDIENTS[id].en)}>
            <IngredientIcon id={id} chopped={dish.chopped.includes(id)} />
            <span className="counter-label">{INGREDIENTS[id].en}</span>
          </button>
        ),
      )}
    </div>
  )
}

// 1. Shopping: find each ingredient in the pantry by its English name.
function ShopStep({ step, dish, setDish, done }: StepProps & { step: Extract<Step, { kind: 'shop' }> }) {
  const timers = useTimers()
  const [k, setK] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const pantry = useMemo(() => {
    const others = shuffle(DISTRACTORS.filter((x) => !step.items.includes(x) && !dish.counter.includes(x))).slice(0, Math.max(2, 6 - step.items.length))
    return shuffle([...step.items, ...others])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const asked = step.items[k]
  const finished = k >= step.items.length

  function choose(id: string) {
    if (finished || dish.counter.includes(id) && step.items.includes(id)) return
    if (id !== asked) {
      playWrong()
      setMistakes((m) => m + 1)
      setWrong((w) => [...w, id])
      timers.push(window.setTimeout(() => speak(`That's ${the(id)}. Find ${the(asked)}!`), 300))
      return
    }
    playCorrect()
    setWrong([])
    setDish((d) => ({ ...d, counter: [...d.counter, id] }))
    const last = k + 1 >= step.items.length
    timers.push(window.setTimeout(() => speak(last ? `${pick(PRAISE)} You have everything!` : `${pick(PRAISE)} ${cap(the(id))}.`), 300))
    setK(k + 1)
    if (last) done(mistakes === 0)
  }

  const text = finished ? { en: 'You have everything!', it: 'Hai tutto!' } : { en: `Find ${the(asked)}!`, it: `Trova: ${INGREDIENTS[asked].it}` }
  return (
    <div className="kitchen">
      <Instruction text={text} timers={timers} hint="Ascolta e tocca l'ingrediente giusto" silent={finished} />
      <div className="pantry">
        {pantry.map((id) => {
          const taken = dish.counter.includes(id) && step.items.includes(id)
          return (
            <button key={id} className={`card pantry-item ${wrong.includes(id) ? 'shake faded' : ''} ${taken ? 'taken' : ''}`} onClick={() => choose(id)} disabled={taken || wrong.includes(id)} aria-label={INGREDIENTS[id].en}>
              <IngredientIcon id={id} />
            </button>
          )
        })}
      </div>
      <p className="hint">🧺 Sul tavolo:</p>
      <Counter dish={dish} />
    </div>
  )
}

const PLACE: Record<Scene, string> = {
  bowl: 'in the bowl', blender: 'in the blender', pizza: 'on the pizza', sandwich: 'on the bread', pan: 'in the pan',
  tin: 'in the cake tin', cake: 'on the cake', glass: 'in the glass', plate: 'on the plate',
}

// 2. Drag each ingredient from the counter onto the dish, in the order asked.
function DragStep({ step, dish, setDish, done }: StepProps & { step: Extract<Step, { kind: 'drag' }> }) {
  const timers = useTimers()
  const target = useRef<HTMLDivElement>(null)
  const [order] = useState(() => {
    const d = step.enter?.(dish) ?? dish
    return step.items === 'counter' ? d.counter : step.items
  })
  useEffect(() => {
    if (step.enter) setDish(step.enter)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [k, setK] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const asked = order[k]
  const finished = k >= order.length
  const where = (id: string) => (dish.scene === 'sandwich' && id === 'bread' ? 'on top' : PLACE[dish.scene])

  function drop(id: string, x: number, y: number) {
    if (finished || !inside(target.current, x, y)) return false
    if (id !== asked) {
      playWrong()
      setMistakes((m) => m + 1)
      speak(`That's ${the(id)}. Put ${the(asked)} ${where(asked)}!`)
      return false
    }
    playPop()
    setDish((d) => {
      const next = { ...d, counter: d.counter.filter((c) => c !== id) }
      if (d.scene === 'sandwich' && id === 'bread') return { ...next, top: true }
      if (d.scene === 'pizza' || d.scene === 'sandwich') return { ...next, layers: [...d.layers, id] }
      return { ...next, inside: [...d.inside, id] }
    })
    const last = k + 1 >= order.length
    if (last) {
      timers.push(window.setTimeout(() => speak(pick(PRAISE)), 300))
      done(mistakes === 0)
    }
    setK(k + 1)
    return true
  }

  const text = finished ? { en: pick(PRAISE), it: 'Bravo!' } : { en: `Put ${the(asked)} ${where(asked)}!`, it: `Metti: ${INGREDIENTS[asked].it}` }
  return (
    <div className="kitchen">
      <Instruction text={text} timers={timers} hint="Trascina l'ingrediente giusto" silent={finished} />
      <div className="work target" ref={target}>
        <DishView dish={dish} />
      </div>
      <Counter dish={dish} drag onDrop={drop} />
    </div>
  )
}

// The tool rack: hear the tool's name and tap it.
function ToolRack({ tool, onRight, onWrong, timers }: { tool: Extract<Step, { kind: 'tool' }>['tool']; onRight: () => void; onWrong: () => void; timers: number[] }) {
  const rack = useMemo(() => shuffle([tool, ...shuffle(TOOL_IDS.filter((t) => t !== tool)).slice(0, 3)]), [tool])
  const [wrong, setWrong] = useState<string[]>([])
  return (
    <div className="rack">
      {rack.map((t) => (
        <button
          key={t}
          className={`card rack-item ${wrong.includes(t) ? 'shake faded' : ''}`}
          disabled={wrong.includes(t)}
          aria-label={TOOLS[t].en}
          onClick={() => {
            if (t !== tool) {
              playWrong()
              setWrong([...wrong, t])
              onWrong()
              timers.push(window.setTimeout(() => speak(`That's the ${TOOLS[t].en}. Take the ${TOOLS[tool].en}!`), 300))
              return
            }
            playCorrect()
            onRight()
          }}
        >
          <ToolIcon tool={t} />
        </button>
      ))}
    </div>
  )
}

// 3. Pick the right tool, then use it: rub to mix, roll or spread; tap to cut; tap to flip.
function ToolStep({ step, dish, setDish, done }: StepProps & { step: Extract<Step, { kind: 'tool' }> }) {
  const timers = useTimers()
  const [phase, setPhase] = useState<'pick' | 'use' | 'done'>('pick')
  const [mistakes, setMistakes] = useState(0)
  const [hand, setHand] = useState<[number, number] | null>(null)
  const [moving, setMoving] = useState(false)
  const [chops, setChops] = useState<Record<string, number>>({})
  const area = useRef<HTMLDivElement>(null)
  const last = useRef<[number, number] | null>(null)
  const progress = useRef(0)
  const toolName = TOOLS[step.tool].en

  useEffect(() => {
    if (step.enter) setDish(step.enter)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function finish() {
    setPhase('done')
    playCorrect()
    if (step.after) setDish(step.after)
    timers.push(window.setTimeout(() => speak(pick(PRAISE)), 300))
    done(mistakes === 0)
  }

  // Rubbing: every bit of movement over the dish moves the job forward.
  function rub(e: PointerEvent) {
    const box = area.current?.getBoundingClientRect()
    if (!box) return
    const pos: [number, number] = [e.clientX - box.left, e.clientY - box.top]
    setHand(pos)
    if (phase !== 'use' || step.act !== 'rub') return
    if (e.pointerType !== 'mouse' && e.buttons === 0) return
    const prev = last.current
    last.current = pos
    if (!prev) return
    const dist = Math.hypot(pos[0] - prev[0], pos[1] - prev[1]) / box.width
    const before = progress.current
    progress.current = Math.min(1, before + dist / 7)
    setMoving(true)
    if (Math.floor(before * 12) !== Math.floor(progress.current * 12)) playSwish()
    const key = step.key!
    setDish((d) => ({ ...d, p: { ...d.p, [key]: progress.current } }))
    if (progress.current >= 1) {
      setMoving(false)
      finish()
    }
  }

  // Chopping: fruit on the board, or the sandwich itself, needs three cuts each.
  const board = step.act === 'chop' && dish.scene !== 'sandwich' ? dish.counter.filter((c) => dish.fruits.includes(c)) : []
  function chop(id: string) {
    if (phase !== 'use') return
    const n = (chops[id] ?? 0) + 1
    playChop()
    const next = { ...chops, [id]: n }
    setChops(next)
    if (n === 3) {
      if (id === 'sandwich') {
        setDish((d) => ({ ...d, cut: true }))
        return finish()
      }
      setDish((d) => ({ ...d, chopped: [...d.chopped, id] }))
      speak(`${cap(the(id))}: done!`)
      if (board.every((b) => (next[b] ?? 0) >= 3)) finish()
    }
  }

  function flip() {
    if (phase !== 'use') return
    playSwish()
    setMoving(true)
    timers.push(window.setTimeout(() => {
      setMoving(false)
      finish()
    }, 700))
  }

  const text =
    phase === 'pick'
      ? { en: `Take the ${toolName}!`, it: `Prendi: ${TOOLS[step.tool].it}` }
      : phase === 'use'
        ? step.say
        : { en: pick(PRAISE), it: 'Bravo!' }
  const hint = phase === 'pick' ? 'Ascolta e tocca lo strumento giusto' : step.act === 'rub' ? 'Tieni premuto e muovi sopra, avanti e indietro' : step.act === 'chop' ? 'Tocca tre volte per tagliare' : 'Tocca il pancake per girarlo'

  return (
    <div className="kitchen">
      <Instruction text={text} timers={timers} hint={phase === 'done' ? undefined : hint} silent={phase === 'done'} />
      {phase === 'pick' && (
        <>
          <div className="work small">
            <DishView dish={dish} />
          </div>
          <ToolRack
            tool={step.tool}
            timers={timers}
            onWrong={() => setMistakes((m) => m + 1)}
            onRight={() => {
              timers.push(window.setTimeout(() => speak(`${pick(PRAISE)} The ${toolName}.`), 300))
              setPhase('use')
            }}
          />
        </>
      )}
      {phase !== 'pick' && step.act === 'rub' && (
        <>
          <div
            ref={area}
            className="work rub"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              last.current = null
              rub(e)
            }}
            onPointerMove={rub}
            onPointerUp={() => {
              last.current = null
              setMoving(false)
            }}
            onPointerLeave={() => setHand(null)}
          >
            <DishView dish={dish} spin={moving} />
            {phase === 'use' && (
              <div className={`hand ${hand ? '' : 'idle'}`} style={hand ? { left: hand[0], top: hand[1] } : undefined}>
                <ToolIcon tool={step.tool} />
              </div>
            )}
          </div>
          <div className="meter"><span style={{ width: `${Math.round((dish.p[step.key!] ?? 0) * 100)}%` }} /></div>
        </>
      )}
      {phase !== 'pick' && step.act === 'chop' && dish.scene === 'sandwich' && (
        <button className="work chop-target" onClick={() => chop('sandwich')} aria-label="sandwich">
          <DishView dish={dish} />
          {phase === 'use' && <span key={chops.sandwich ?? 0} className="knife-hit"><ToolIcon tool="knife" /></span>}
        </button>
      )}
      {phase !== 'pick' && step.act === 'chop' && dish.scene !== 'sandwich' && (
        <div className="chop-board">
          {board.map((id) => (
            <button key={id} className="chop-item" onClick={() => chop(id)} disabled={(chops[id] ?? 0) >= 3} aria-label={INGREDIENTS[id].en}>
              <IngredientIcon id={id} chopped={(chops[id] ?? 0) >= 3} />
              {phase === 'use' && (chops[id] ?? 0) < 3 && <span key={chops[id] ?? 0} className="knife-hit"><ToolIcon tool="knife" /></span>}
              <span className="counter-label">{INGREDIENTS[id].en}</span>
            </button>
          ))}
        </div>
      )}
      {phase !== 'pick' && step.act === 'flip' && (
        <button className="work chop-target" onClick={flip} aria-label="pancake">
          <DishView dish={dish} spin={moving} />
          {phase === 'use' && <span className="hand idle"><ToolIcon tool="spatula" /></span>}
        </button>
      )}
    </div>
  )
}

const ON_IN = (device: string) => (device === 'cooker' ? 'on the' : 'in the')

// 4. Put the dish into the named device, switch it on and wait until it is ready.
function DeviceStep({ step, dish, setDish, done }: StepProps & { step: Extract<Step, { kind: 'device' }> }) {
  const timers = useTimers()
  const [phase, setPhase] = useState<'place' | 'power' | 'cooking' | 'ready'>(step.put ? 'place' : 'power')
  const [mistakes, setMistakes] = useState(0)
  const [time, setTime] = useState(0)
  const refs = useRef<Record<string, HTMLDivElement | null>>({})
  const choices = useMemo(() => shuffle([step.device, ...shuffle(DEVICE_IDS.filter((d) => d !== step.device && d !== 'blender')).slice(0, 2)]), [step.device])
  const name = DEVICES[step.device].en
  const view = step.enter?.(dish) ?? dish

  useEffect(() => {
    if (step.enter) setDish(step.enter)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function drop(x: number, y: number) {
    const hit = choices.find((c) => inside(refs.current[c], x, y, 4))
    if (!hit) return false
    if (hit !== step.device) {
      playWrong()
      setMistakes((m) => m + 1)
      speak(`That's the ${DEVICES[hit].en}. Put the ${step.what.en} ${ON_IN(step.device)} ${name}!`)
      return false
    }
    playPop()
    setPhase('power')
    return true
  }

  function switchOn() {
    if (phase !== 'power') return
    playCorrect()
    setPhase('cooking')
    const total = step.device === 'cooker' ? 6 : 10
    for (let i = 1; i <= total; i++) {
      timers.push(window.setTimeout(() => {
        setTime(i / total)
        if (i < total) playBubble()
        else {
          playDing()
          setDish(step.after)
          setPhase('ready')
          timers.push(window.setTimeout(() => speak(step.ready.en), 500))
          done(mistakes === 0)
        }
      }, i * 350))
    }
  }

  const text =
    phase === 'place'
      ? { en: `Put the ${step.what.en} ${ON_IN(step.device)} ${name}!`, it: `Metti ${step.what.it}: ${DEVICES[step.device].it}` }
      : phase === 'power'
        ? { en: `Turn on the ${name}!`, it: `Accendi: ${DEVICES[step.device].it}` }
        : phase === 'cooking'
          ? { en: 'Wait…', it: 'Aspetta…' }
          : step.ready

  if (phase === 'place')
    return (
      <div className="kitchen">
        <Instruction text={text} timers={timers} hint="Trascina nel posto giusto" />
        <div className="devices">
          {choices.map((c) => (
            <div key={c} className="device-choice" aria-label={DEVICES[c].en} ref={(el) => { refs.current[c] = el }}>
              <DeviceArt device={c} />
            </div>
          ))}
        </div>
        <Draggable className="carry" label={step.what.en} onDrop={drop} onTap={() => speak(step.what.en)}>
          <DishView dish={view} className="dish mini" />
        </Draggable>
      </div>
    )

  const spot = DEVICE_SPOTS[step.device]
  const cooking = phase === 'cooking'
  return (
    <div className="kitchen">
      <Instruction text={text} timers={timers} hint={phase === 'power' ? 'Tocca il pulsante ON' : undefined} silent={phase !== 'power'} />
      <div className={`device-big ${cooking ? 'cooking' : ''}`}>
        {step.device === 'blender' ? (
          <DishView dish={dish} spin={cooking} />
        ) : (
          <>
            <DeviceArt device={step.device} on={cooking} className="device-art" />
            {phase !== 'ready' && (
              <div className="in-device" style={{ left: `${spot.dish[0]}%`, top: `${spot.dish[1]}%`, width: `${spot.dish[2]}%` }}>
                <DishView dish={view} className="dish mini" />
              </div>
            )}
          </>
        )}
        {phase === 'power' && (
          <button className="power" style={{ left: `${spot.button[0]}%`, top: `${spot.button[1]}%` }} onClick={switchOn}>
            ON
          </button>
        )}
        {cooking && <span className="steam">♨️</span>}
      </div>
      {cooking && <div className="meter"><span style={{ width: `${Math.round(time * 100)}%` }} /></div>}
      {phase === 'ready' && step.device !== 'blender' && (
        <div className="work small pop">
          <DishView dish={dish} />
        </div>
      )}
    </div>
  )
}

// 5. Pour or move the dish from one container into the next.
function MoveStep({ step, dish, setDish, done }: StepProps & { step: Extract<Step, { kind: 'move' }> }) {
  const timers = useTimers()
  const target = useRef<HTMLDivElement>(null)
  const [moved, setMoved] = useState(false)
  const from = { scene: step.from, mix: dish.mix, layers: step.from === 'pan' ? dish.layers : [], cooked: dish.cooked }
  const to = moved ? dish : { scene: step.to, mix: step.to === 'pan' ? dish.mix : undefined }

  function drop(x: number, y: number) {
    if (moved || !inside(target.current, x, y)) return false
    playPop()
    setMoved(true)
    setDish(step.after)
    timers.push(window.setTimeout(() => speak(pick(PRAISE)), 300))
    done(true)
    return true
  }

  return (
    <div className="kitchen">
      <Instruction text={moved ? { en: pick(PRAISE), it: 'Bravo!' } : step.say} timers={timers} hint={moved ? undefined : 'Trascina sopra'} silent={moved} />
      <div className="work target" ref={target}>
        <DishView dish={to} />
      </div>
      {!moved && (
        <Draggable className="carry" label={step.from} onDrop={drop}>
          <DishView dish={from} className="dish mini" />
        </Draggable>
      )}
    </div>
  )
}

// 6. The child's own choices: toppings anywhere on the dish, sandwich layers, icing colour, fruit.
function CustomStep({ step, dish, setDish, done }: StepProps & { step: Extract<Step, { kind: 'custom' }> }) {
  const timers = useTimers()
  const target = useRef<HTMLDivElement>(null)
  const [finished, setFinished] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [start] = useState(dish)
  const count = step.mode === 'place' ? dish.toppings.length - start.toppings.length : step.mode === 'layer' ? dish.layers.length - start.layers.length : step.mode === 'color' ? (dish.color ? 1 : 0) : picked.length

  function drop(id: string, x: number, y: number) {
    const el = target.current?.querySelector('svg')
    if (finished || !el || !inside(el, x, y, 8)) return false
    if (count >= step.max) {
      playWrong()
      setNote('Basta così! Tocca ✅ quando hai finito.')
      return false
    }
    playPop()
    speak(INGREDIENTS[id].en)
    if (step.mode === 'layer') {
      setDish((d) => ({ ...d, layers: [...d.layers, id] }))
    } else {
      const r = el.getBoundingClientRect()
      const [px, py] = clampTopping(dish.scene, ((x - r.left) / r.width) * 200, ((y - r.top) / r.height) * 200, dish)
      setDish((d) => ({ ...d, toppings: [...d.toppings, [id, px, py]] }))
    }
    return true
  }

  function undo() {
    if (step.mode === 'place') setDish((d) => ({ ...d, toppings: d.toppings.length > start.toppings.length ? d.toppings.slice(0, -1) : d.toppings }))
    if (step.mode === 'layer') setDish((d) => ({ ...d, layers: d.layers.length > start.layers.length ? d.layers.slice(0, -1) : d.layers }))
    setNote('')
  }

  function toggle(id: string) {
    if (finished) return
    if (picked.includes(id)) return setPicked(picked.filter((p) => p !== id))
    if (picked.length >= step.max) {
      playWrong()
      return setNote(`Al massimo ${step.max}! Tocca un frutto scelto per toglierlo.`)
    }
    playPop()
    speak(INGREDIENTS[id].en)
    setNote('')
    setPicked([...picked, id])
  }

  function finish() {
    if (finished) return
    setFinished(true)
    playCorrect()
    let said = ''
    if (step.mode === 'pick') {
      setDish((d) => ({ ...d, fruits: picked, counter: [...d.counter, ...picked] }))
      said = `${cap(picked.map((f) => INGREDIENTS[f].en).join(', ').replace(/, ([^,]*)$/, ' and $1'))}. Yummy!`
    } else if (step.mode === 'color') said = `${cap(COLORS[dish.color!].en)} icing. Yummy!`
    else said = `${describe(dish).en}. Yummy!`
    timers.push(window.setTimeout(() => speak(said), 300))
    done(true)
  }

  const text = finished ? { en: 'Yummy!', it: 'Che buono!' } : step.say
  const ready = count > 0
  return (
    <div className="kitchen">
      <Instruction text={text} timers={timers} silent={finished} hint={finished ? undefined : step.mode === 'pick' || step.mode === 'color' ? 'Tocca per scegliere, poi ✅' : 'Trascina quello che vuoi sopra, poi ✅'} />
      {step.mode !== 'pick' && (
        <div className="work target" ref={target}>
          <DishView dish={step.mode === 'color' ? { ...dish, p: { ...dish.p, icing: 1 } } : dish} />
        </div>
      )}
      {(step.mode === 'place' || step.mode === 'layer') && (
        <div className="palette">
          {step.options.map((id) => (
            <Draggable key={id} className="palette-item" label={INGREDIENTS[id].en} onDrop={(x, y) => drop(id, x, y)} onTap={() => speak(INGREDIENTS[id].en)}>
              <IngredientIcon id={id} />
              <span className="counter-label">{INGREDIENTS[id].en}</span>
            </Draggable>
          ))}
        </div>
      )}
      {step.mode === 'color' && (
        <div className="palette">
          {step.options.map((id) => (
            <button
              key={id}
              className={`swatch ${dish.color === id ? 'on' : ''}`}
              onClick={() => {
                if (finished) return
                playPop()
                speak(COLORS[id].en)
                setDish((d) => ({ ...d, color: id }))
              }}
            >
              <span className="swatch-dot" style={{ background: COLORS[id].color }} />
              <span className="counter-label">{COLORS[id].en}</span>
            </button>
          ))}
        </div>
      )}
      {step.mode === 'pick' && (
        <div className="pantry">
          {step.options.map((id) => (
            <button key={id} className={`card pantry-item ${picked.includes(id) ? 'chosen' : ''}`} onClick={() => toggle(id)}>
              <IngredientIcon id={id} />
              <span className="counter-label">{INGREDIENTS[id].en}</span>
            </button>
          ))}
        </div>
      )}
      {note && <p className="note">{note}</p>}
      {!finished && (
        <div className="cook-actions">
          {(step.mode === 'place' || step.mode === 'layer') && (
            <button className="help" onClick={undo} disabled={!ready}>↩️ Togli</button>
          )}
          <button className="big done-button" onClick={finish} disabled={!ready}>✅ Finished!</button>
        </div>
      )}
    </div>
  )
}

// 7. The finished dish goes into the fridge at home.
function FridgeStep({ dish, done, recipe }: StepProps & { recipe: Recipe }) {
  const timers = useTimers()
  const target = useRef<HTMLDivElement>(null)
  const [stored, setStored] = useState(false)
  const [full, setFull] = useState(false)
  const yours = recipe.id === 'pancakes' ? 'your pancakes' : `your ${recipe.en}`

  function drop(x: number, y: number) {
    if (stored || !inside(target.current, x, y)) return false
    playPop()
    setFull(addToFridge(dish))
    setStored(true)
    timers.push(window.setTimeout(() => {
      playDing()
      speak(recipe.id === 'pancakes' ? 'Your pancakes are in the fridge. You can find them in your house!' : `${cap(yours)} is in the fridge. You can find it in your house!`)
    }, 400))
    done(true)
    return true
  }

  return (
    <div className="kitchen">
      <Instruction
        text={stored ? { en: 'You can find it in your house!', it: 'Lo trovi nel frigo della tua casa 🏠' } : { en: `Put ${yours} in the fridge!`, it: 'Metti il piatto nel frigo!' }}
        timers={timers}
        hint={stored ? undefined : 'Trascina nel frigo'}
        silent={stored}
      />
      <div className="fridge-drop" ref={target}>
        <FridgeArt open={!stored} />
        {stored && <span className="fridge-stored pop">✅</span>}
      </div>
      {!stored && (
        <Draggable className="carry" label={recipe.en} onDrop={drop}>
          <DishView dish={dish} className="dish mini" />
        </Draggable>
      )}
      {full && <p className="note">Il frigo era pieno: il piatto più vecchio è stato mangiato 😋</p>}
    </div>
  )
}

function Kitchen({ recipe, onBack, onFinish }: { recipe: Recipe; onBack: () => void; onFinish: (stars: number) => void }) {
  const [dish, setDishState] = useState<Dish>(() => newDish(recipe))
  const setDish = (f: (d: Dish) => Dish) => setDishState((d) => f(d))
  return (
    <GameFrame total={recipe.steps.length} onBack={onBack} onFinish={onFinish} multiplier={LEVEL_MULTIPLIER['2']} delay={500}>
      {(i, done) => {
        const step = recipe.steps[i]
        const props = { dish, setDish, done }
        switch (step.kind) {
          case 'shop':
            return <ShopStep step={step} {...props} />
          case 'drag':
            return <DragStep step={step} {...props} />
          case 'tool':
            return <ToolStep step={step} {...props} />
          case 'device':
            return <DeviceStep step={step} {...props} />
          case 'move':
            return <MoveStep step={step} {...props} />
          case 'custom':
            return <CustomStep step={step} {...props} />
          case 'fridge':
            return <FridgeStep recipe={recipe} {...props} />
        }
      }}
    </GameFrame>
  )
}

export function CookingGame({ onBack, onFinish }: { onBack: () => void; onFinish: (stars: number) => void }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [round, setRound] = useState(0)
  const timers = useTimers()
  const inFridge = useMemo(() => loadFridge().length, [recipe]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!recipe) whenQuiet(() => speak('What do you want to cook today?'), timers, 400)
  }, [recipe]) // eslint-disable-line react-hooks/exhaustive-deps

  if (recipe)
    return (
      <Kitchen
        key={round}
        recipe={recipe}
        onBack={() => {
          setRecipe(null)
          setRound(round + 1)
        }}
        onFinish={onFinish}
      />
    )

  return (
    <div className="screen">
      <header className="topbar">
        <button className="round" onClick={onBack} aria-label="Indietro">⬅️</button>
        <h2>🍳 In cucina</h2>
        <span />
      </header>
      <button className="cook-title" onClick={() => speak('What do you want to cook today?')}>
        🔊 What do you want to cook today?
        <span className="hint">Cosa vuoi cucinare oggi?</span>
      </button>
      <div className="grid categories">
        {RECIPES.map((r) => (
          <button
            key={r.id}
            className="category"
            style={{ background: r.color }}
            onClick={() => {
              speak(r.id === 'pancakes' ? "Let's make pancakes!" : `Let's make a ${r.en}!`)
              setRecipe(r)
            }}
          >
            <span className="emoji">{r.emoji}</span>
            <span className="label">{r.en}</span>
            <span className="best">{r.it}</span>
          </button>
        ))}
      </div>
      <p className="hint">🧊 Nel frigo di casa: {inFridge} {inFridge === 1 ? 'piatto' : 'piatti'}</p>
    </div>
  )
}
