import { useEffect, useMemo, useRef, useState } from 'react'
import { basicTopics, type Word } from '../data/words'
import { playCorrect, playWrong, speak } from '../audio'
import { shuffle } from '../utils'
import { GameFrame } from './GameFrame'
import { LEVEL_MULTIPLIER } from '../rewards'

// A character walks on a grid. In "follow" rounds the child hears directions in English
// ("Go right two steps!") and presses the matching arrows; in "find" rounds they hear
// "Go to the apple!" and walk there on their own.

const SIZE = 5
const ROUNDS = 6

type Dir = 'up' | 'down' | 'left' | 'right'
type Pos = { r: number; c: number }
type Command = { dir: Dir; n: number; verb: string }

const STEP: Record<Dir, Pos> = { up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 } }
const DIR_IT: Record<Dir, string> = { up: 'su', down: 'giù', left: 'a sinistra', right: 'a destra' }
const ARROW: Record<Dir, string> = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' }
const NUMBERS = ['zero', 'one', 'two', 'three', 'four']
const KEYS: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }

const HEROES = [
  { hero: '🐰', goal: '🥕', name: 'carrot' },
  { hero: '🐶', goal: '🦴', name: 'bone' },
  { hero: '🐵', goal: '🍌', name: 'banana' },
  { hero: '🐱', goal: '🐟', name: 'fish' },
  { hero: '🐭', goal: '🧀', name: 'cheese' },
]

// Things to look for in "find" rounds: single words the child met in the 1-2 topics,
// minus the animals that walk on the board.
const THINGS: Word[] = basicTopics
  .filter((t) => t.id === 'animals' || t.id === 'food')
  .flatMap((t) => t.words)
  .filter((w) => /^[a-z]+$/.test(w.en) && !HEROES.some((h) => h.hero === w.emoji))

type Round =
  | { kind: 'follow'; hero: string; goal: string; name: string; start: Pos; end: Pos; blocks: string[]; commands: Command[] }
  | { kind: 'find'; hero: string; start: Pos; blocks: string[]; items: { pos: Pos; word: Word }[]; target: Word }

const key = (p: Pos) => `${p.r},${p.c}`
const inside = (p: Pos) => p.r >= 0 && p.r < SIZE && p.c >= 0 && p.c < SIZE
const rand = (n: number) => Math.floor(Math.random() * n)
const randPos = (): Pos => ({ r: rand(SIZE), c: rand(SIZE) })

// Varied wording so the directions don't sound the same every time.
const FIRST_VERBS = ['Go', 'Move', 'Walk']
const NEXT_VERBS = ['Now go', 'Then walk', 'Now move', 'Go']
const pick = <T,>(list: T[]) => list[rand(list.length)]

const commandText = ({ dir, n, verb }: Command) => `${verb} ${dir} ${NUMBERS[n]} ${n === 1 ? 'step' : 'steps'}!`
const commandIt = ({ dir, n }: Command) => `Vai ${DIR_IT[dir]} di ${n} ${n === 1 ? 'passo' : 'passi'}`

// Shortest paths from start, as the list of directions to reach each cell.
function paths(start: Pos, blocks: Set<string>) {
  const found = new Map<string, Dir[]>([[key(start), []]])
  const queue = [start]
  while (queue.length) {
    const p = queue.shift()!
    for (const dir of shuffle(Object.keys(STEP) as Dir[])) {
      const q = { r: p.r + STEP[dir].r, c: p.c + STEP[dir].c }
      if (!inside(q) || blocks.has(key(q)) || found.has(key(q))) continue
      found.set(key(q), [...found.get(key(p))!, dir])
      queue.push(q)
    }
  }
  return found
}

function toCommands(dirs: Dir[]): Command[] {
  const out: Command[] = []
  for (const dir of dirs) {
    const last = out[out.length - 1]
    if (last && last.dir === dir) last.n++
    else out.push({ dir, n: 1, verb: pick(out.length ? NEXT_VERBS : FIRST_VERBS) })
  }
  return out
}

function randomBlocks(start: Pos, count: number) {
  const blocks = new Set<string>()
  while (blocks.size < count) {
    const p = randPos()
    if (key(p) !== key(start)) blocks.add(key(p))
  }
  return blocks
}

// Later rounds get longer walks with more turns.
function makeFollow(index: number): Round {
  const { hero, goal, name } = HEROES[rand(HEROES.length)]
  const minTurns = index < 2 ? 2 : 3
  for (;;) {
    const start = randPos()
    const blocks = randomBlocks(start, 5)
    const reach = [...paths(start, blocks).entries()].filter(([, d]) => {
      const cmds = toCommands(d)
      return d.length >= 3 + index && cmds.length >= minTurns && cmds.length <= minTurns + 1 && cmds.every((c) => c.n <= 3)
    })
    if (!reach.length) continue
    const [endKey, dirs] = reach[rand(reach.length)]
    const [r, c] = endKey.split(',').map(Number)
    return { kind: 'follow', hero, goal, name, start, end: { r, c }, blocks: [...blocks], commands: toCommands(dirs) }
  }
}

function makeFind(): Round {
  const { hero } = HEROES[rand(HEROES.length)]
  for (;;) {
    const start = randPos()
    const blocks = randomBlocks(start, 4)
    const far = [...paths(start, blocks).entries()].filter(([, d]) => d.length >= 2)
    if (far.length < 4) continue
    const words = shuffle(THINGS).slice(0, 4)
    const items = shuffle(far)
      .slice(0, 4)
      .map(([k], i) => {
        const [r, c] = k.split(',').map(Number)
        return { pos: { r, c }, word: words[i] }
      })
    return { kind: 'find', hero, start, blocks: [...blocks], items, target: words[rand(words.length)] }
  }
}

function makeRounds(): Round[] {
  return Array.from({ length: ROUNDS }, (_, i) => (i % 2 === 0 ? makeFollow(i / 2) : makeFind()))
}

function Board({ hero, at, blocks, items, shake }: { hero: string; at: Pos; blocks: string[]; items: { pos: Pos; emoji: string; shake?: boolean; done?: boolean }[]; shake: boolean }) {
  const cells = []
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const k = key({ r, c })
      cells.push(
        <span key={k} className={`cell ${(r + c) % 2 ? 'alt' : ''}`}>
          {blocks.includes(k) ? ((r * 3 + c) % 3 === 0 ? '🪨' : '🌳') : ''}
        </span>,
      )
    }
  return (
    <div className="board">
      {cells}
      {items.map((it) => (
        <span
          key={key(it.pos)}
          className="piece item"
          style={{ transform: `translate(${it.pos.c * 100}%, ${it.pos.r * 100}%)` }}
        >
          <span className={it.shake ? 'shake' : it.done ? 'pop' : ''}>{it.emoji}</span>
        </span>
      ))}
      <span className="piece hero" style={{ transform: `translate(${at.c * 100}%, ${at.r * 100}%)` }}>
        <span className={shake ? 'shake' : 'hop'} key={key(at) + String(shake)}>{hero}</span>
      </span>
    </div>
  )
}

function MazeRound({ round, onDone }: { round: Round; onDone: (firstTry: boolean) => void }) {
  const [at, setAt] = useState(round.start)
  const [cmd, setCmd] = useState(0)
  const [stepsLeft, setStepsLeft] = useState(round.kind === 'follow' ? round.commands[0].n : 0)
  const [mistakes, setMistakes] = useState(0)
  const [shake, setShake] = useState(false)
  const [wrongItem, setWrongItem] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)

  const prompt = round.kind === 'follow' ? commandText(round.commands[Math.min(cmd, round.commands.length - 1)]) : `Go to the ${round.target.en}!`
  const say = () => speak(prompt)

  useEffect(() => {
    const t = setTimeout(() => speak(prompt), 400)
    return () => clearTimeout(t)
  }, [prompt])

  function bump() {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  function finish(text: string) {
    setSolved(true)
    playCorrect()
    setTimeout(() => speak(text), 500)
    onDone(mistakes === 0)
  }

  function move(dir: Dir) {
    if (solved) return
    const next = { r: at.r + STEP[dir].r, c: at.c + STEP[dir].c }

    if (round.kind === 'follow') {
      if (dir !== round.commands[cmd].dir) {
        playWrong()
        setMistakes((m) => m + 1)
        bump()
        setTimeout(say, 500)
        return
      }
      setAt(next)
      if (stepsLeft > 1) return setStepsLeft(stepsLeft - 1)
      if (cmd + 1 < round.commands.length) {
        setCmd(cmd + 1)
        setStepsLeft(round.commands[cmd + 1].n)
      } else {
        finish(pick([`Well done! You found the ${round.name}!`, `Yummy! A ${round.name}!`, `Great job! Here is the ${round.name}!`]))
      }
      return
    }

    // Find round: free walking, trees and the edge just stop the character.
    if (!inside(next) || round.blocks.includes(key(next))) return bump()
    setAt(next)
    const item = round.items.find((it) => key(it.pos) === key(next))
    if (!item) return
    if (item.word === round.target) return finish(pick([`Yes! This is the ${item.word.en}!`, `Great! You found the ${item.word.en}!`, `Well done! The ${item.word.en}!`]))
    playWrong()
    setMistakes((m) => m + 1)
    setWrongItem(key(next))
    setTimeout(() => setWrongItem(null), 500)
    setTimeout(() => speak(`This is the ${item.word.en}. Go to the ${round.target.en}!`), 400)
  }

  // Arrow keys on a computer keyboard work like the on-screen buttons.
  const moveRef = useRef(move)
  useEffect(() => {
    moveRef.current = move
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEYS[e.key]
      if (!dir) return
      e.preventDefault()
      moveRef.current(dir)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const items =
    round.kind === 'follow'
      ? [{ pos: round.end, emoji: round.goal, done: solved }]
      : round.items.map((it) => ({ pos: it.pos, emoji: it.word.emoji, shake: wrongItem === key(it.pos), done: solved && it.word === round.target }))

  return (
    <div className="question maze">
      <p className="hint">
        Tu sei <span className="you">{round.hero}</span> {round.kind === 'follow' ? 'Segui le indicazioni!' : 'Vai alla cosa giusta!'}
      </p>
      <button className="command" onClick={say} aria-label="Ascolta di nuovo">
        🔊 {solved ? '🎉' : prompt}
      </button>
      <p className="cue">
        {round.kind === 'follow' && !solved ? (
          <>
            {Array.from({ length: round.commands[cmd].n }, (_, i) => (
              <span key={i} className={i < round.commands[cmd].n - stepsLeft ? 'cue-done' : ''}>{ARROW[round.commands[cmd].dir]}</span>
            ))}
            {mistakes >= 2 && <span className="cue-it">{commandIt(round.commands[cmd])}</span>}
          </>
        ) : (
          ' '
        )}
      </p>
      <Board hero={round.hero} at={at} blocks={round.blocks} items={items} shake={shake} />
      <div className="pad">
        {(['up', 'left', 'down', 'right'] as Dir[]).map((d) => (
          <button key={d} className={`tile arrow ${d}`} onClick={() => move(d)} aria-label={d}>
            {ARROW[d]}
          </button>
        ))}
      </div>
    </div>
  )
}

export function MazeGame({ onBack, onFinish }: { onBack: () => void; onFinish: (stars: number) => void }) {
  const rounds = useMemo(() => makeRounds(), [])
  return (
    <GameFrame total={rounds.length} onBack={onBack} onFinish={onFinish} multiplier={LEVEL_MULTIPLIER['2']}>
      {(i, done) => <MazeRound round={rounds[i]} onDone={done} />}
    </GameFrame>
  )
}
