import { useEffect, useMemo, useState } from 'react'
import { playCorrect, playFanfare, playWrong, speak } from '../audio'
import { load, save, shuffle } from '../utils'
import {
  allItems,
  floorPrice,
  ITEMS_PER_SQUARE,
  MAX_FLOORS,
  MAX_WIDTH,
  MISSION_REWARD,
  ROOM_PRICE,
  rooms,
  shop,
  squarePrice,
  type Room,
  type ShopItem,
} from '../data/shop'
import type { Wallet } from '../rewards'

// The child's own house: coins earned in the games buy squares, floors, rooms and things to
// put inside. Every purchase is a small English quiz, and a bear gives missions in English.

type Square = { room?: string; items: string[] }
type Mission = { kind: 'room'; room: string; text: string; it: string } | { kind: 'item'; item: string; room: string; text: string; it: string }
type HouseState = { width: number; squares: Square[][]; mission?: Mission; missions: number }

const HOUSE_KEY = 'learn-english-house'
const START: HouseState = { width: 3, squares: [[{ items: [] }, { items: [] }, { items: [] }]], missions: 0 }

type Tab = 'room' | 'build' | string
type Quiz = { emoji: string; answer: string; options: string[]; buy: () => void }

const roomById = (id?: string) => rooms.find((r) => r.id === id)
const itemById = (id: string) => allItems.find((i) => i.id === id)!
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
const withArticle = (en: string) => (en.endsWith('s') ? `some ${en}` : /^[aeiou]/.test(en) ? `an ${en}` : `a ${en}`)

function newMission(house: HouseState): Mission | undefined {
  const flat = house.squares.flat()
  const have = [...new Set(flat.map((s) => s.room).filter((r): r is string => !!r))]
  const missing = rooms.filter((r) => !have.includes(r.id))
  for (let tries = 0; tries < 30; tries++) {
    if (!have.length || (missing.length && Math.random() < 0.35)) {
      const room = pick(missing)
      return {
        kind: 'room',
        room: room.id,
        text: pick([`Make a ${room.en}, please!`, `Your house needs a ${room.en}!`]),
        it: `Crea una stanza: ${room.it}`,
      }
    }
    const item = pick(allItems)
    const room = roomById(pick(have))!
    const done = flat.some((s) => s.room === room.id && s.items.includes(item.id))
    if (done) continue
    const thing = withArticle(item.en)
    return {
      kind: 'item',
      item: item.id,
      room: room.id,
      text: pick([`Put ${thing} in the ${room.en}!`, `Can you put ${thing} in the ${room.en}?`, `I want ${thing} in the ${room.en}!`]),
      it: `Metti: ${item.it} → ${room.it}`,
    }
  }
  return undefined
}

function missionDone(house: HouseState, m: Mission) {
  const flat = house.squares.flat()
  return m.kind === 'room' ? flat.some((s) => s.room === m.room) : flat.some((s) => s.room === m.room && s.items.includes(m.item))
}

type Props = { wallet: Wallet; onWallet: (w: Wallet) => void; onBack: () => void }

export function House({ wallet, onWallet, onBack }: Props) {
  const [house, setHouse] = useState<HouseState>(() => {
    const saved = load<HouseState>(HOUSE_KEY, START)
    return saved.mission ? saved : { ...saved, mission: newMission(saved) }
  })
  const [sel, setSel] = useState({ f: 0, c: 0 })
  const [tab, setTab] = useState<Tab>('room')
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [wrong, setWrong] = useState<string[]>([])
  const [right, setRight] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [showIt, setShowIt] = useState(false)

  const floors = house.squares.length
  const square = house.squares[sel.f]?.[sel.c] ?? { items: [] }

  useEffect(() => save(HOUSE_KEY, house), [house])

  useEffect(() => {
    if (!house.mission) return
    const t = setTimeout(() => speak(house.mission!.text), 500)
    return () => clearTimeout(t)
  }, [house.mission])

  // Applies a change, pays for it, and checks whether the bear's mission is now done.
  function update(change: (h: HouseState) => HouseState, cost: number) {
    let next = change(house)
    let coins = wallet.coins - cost
    if (next.mission && missionDone(next, next.mission)) {
      coins += MISSION_REWARD
      next = { ...next, missions: next.missions + 1 }
      next.mission = newMission(next)
      setTimeout(() => {
        playFanfare()
        speak('Thank you! Here are your coins!')
      }, 1200)
      setNote(`🎉 Missione compiuta! +${MISSION_REWARD} 🪙`)
    }
    setHouse(next)
    onWallet({ ...wallet, coins })
  }

  function canPay(price: number) {
    if (wallet.coins >= price) return true
    playWrong()
    setNote(`Ti servono ancora ${price - wallet.coins} 🪙. Gioca agli esercizi per guadagnarle!`)
    return false
  }

  function ask(emoji: string, answer: string, pool: string[], buy: () => void) {
    setWrong([])
    setRight(null)
    setNote('')
    setQuiz({ emoji, answer, options: shuffle([answer, ...shuffle(pool.filter((p) => p !== answer)).slice(0, 2)]), buy })
  }

  function answer(option: string) {
    if (!quiz || right) return
    if (option !== quiz.answer) {
      playWrong()
      setWrong([...wrong, option])
      return
    }
    playCorrect()
    setRight(option)
    speak(option)
    setTimeout(() => {
      quiz.buy()
      setQuiz(null)
    }, 900)
  }

  const setSquare = (h: HouseState, f: number, c: number, s: Square) => ({
    ...h,
    squares: h.squares.map((row, fi) => (fi === f ? row.map((old, ci) => (ci === c ? s : old)) : row)),
  })

  function buyRoom(room: Room) {
    if (square.room === room.id) return speak(room.en)
    if (!canPay(ROOM_PRICE)) return
    ask(room.emoji, room.en, rooms.map((r) => r.en), () => update((h) => setSquare(h, sel.f, sel.c, { ...square, room: room.id }), ROOM_PRICE))
  }

  function buyItem(item: ShopItem, category: ShopItem[]) {
    if (square.items.length >= ITEMS_PER_SQUARE) {
      playWrong()
      return setNote('Questo quadratino è pieno: scegline un altro o togli qualcosa.')
    }
    if (!canPay(item.price)) return
    ask(item.emoji, item.en, category.map((i) => i.en), () =>
      update((h) => setSquare(h, sel.f, sel.c, { ...square, items: [...square.items, item.id] }), item.price),
    )
  }

  function removeItem(index: number) {
    const item = itemById(square.items[index])
    const refund = Math.floor(item.price / 2)
    speak(`Goodbye ${item.en}!`)
    setNote(`Hai venduto: ${item.it}. +${refund} 🪙`)
    update((h) => setSquare(h, sel.f, sel.c, { ...square, items: square.items.filter((_, i) => i !== index) }), -refund)
  }

  function addSquare() {
    const price = squarePrice(house.width, floors)
    if (house.width >= MAX_WIDTH || !canPay(price)) return
    speak('One more square!')
    update((h) => ({ ...h, width: h.width + 1, squares: h.squares.map((row) => [...row, { items: [] }]) }), price)
  }

  function addFloor() {
    const price = floorPrice(floors)
    if (floors >= MAX_FLOORS || !canPay(price)) return
    speak('A new floor!')
    update((h) => ({ ...h, squares: [...h.squares, Array.from({ length: h.width }, () => ({ items: [] }))] }), price)
    setSel({ f: floors, c: 0 })
  }

  const category = shop.find((c) => c.id === tab)
  const floorNames = ['ground floor', 'first floor', 'second floor', 'third floor']
  const order = useMemo(() => house.squares.map((_, i) => i).reverse(), [house.squares])

  return (
    <div className="screen house-screen">
      <header className="topbar">
        <button className="round" onClick={onBack} aria-label="Indietro">⬅️</button>
        <h2>🏠 La mia casa</h2>
        <span className="coins">🪙 {wallet.coins}</span>
      </header>

      {house.mission && (
        <div className="mission">
          <span className="mission-who">🐻</span>
          <button className="mission-text" onClick={() => speak(house.mission!.text)}>
            {house.mission.text} 🔊
            {showIt && <span className="bubble-it">{house.mission.it}</span>}
          </button>
          <div className="mission-side">
            <span className="mission-reward">+{MISSION_REWARD} 🪙</span>
            <button className="it-toggle" onClick={() => setShowIt(!showIt)} aria-label="Traduzione in italiano">🇮🇹</button>
          </div>
        </div>
      )}

      <div className="house" style={{ ['--w' as string]: house.width }}>
        <div className="roof" />
        {order.map((f) => (
          <div key={f} className="floor">
            {house.squares[f].map((s, c) => {
              const room = roomById(s.room)
              const left = house.squares[f][c - 1]
              const startsRoom = !left || left.room !== s.room
              const selected = sel.f === f && sel.c === c
              return (
                <button
                  key={c}
                  className={`sq ${room ? '' : 'empty'} ${startsRoom ? 'wall' : ''} ${selected ? 'selected' : ''}`}
                  style={{ background: room?.color }}
                  onClick={() => {
                    setSel({ f, c })
                    setNote('')
                    if (room) speak(`The ${room.en}`)
                  }}
                  aria-label={room ? room.en : 'empty square'}
                >
                  {room && startsRoom && <span className="sq-label">{room.en}</span>}
                  <span className="sq-items">
                    {s.items.map((id, i) => (
                      <span key={i}>{itemById(id).emoji}</span>
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
        <div className="grass" />
      </div>

      <div className="selected-info">
        <span>
          📍 {floorNames[sel.f]} · {roomById(square.room)?.en ?? 'empty'}
        </span>
        {square.items.map((id, i) => {
          const item = itemById(id)
          return (
            <span key={i} className="owned">
              <button onClick={() => speak(item.en)}>{item.emoji} {item.en}</button>
              <button className="sell" onClick={() => removeItem(i)} aria-label={`Vendi ${item.it}`}>✖</button>
            </span>
          )
        })}
      </div>

      {note && <p className="note">{note}</p>}

      <div className="tabs">
        <button className={tab === 'room' ? 'on' : ''} onClick={() => setTab('room')}>🚪 Stanze</button>
        {shop.map((c) => (
          <button key={c.id} className={tab === c.id ? 'on' : ''} onClick={() => setTab(c.id)}>
            {c.emoji} {c.title}
          </button>
        ))}
        <button className={tab === 'build' ? 'on' : ''} onClick={() => setTab('build')}>🧱 Amplia</button>
      </div>

      <div className="shop">
        {tab === 'room' &&
          rooms.map((r) => (
            <button key={r.id} className="shop-card" style={{ background: r.color }} onClick={() => buyRoom(r)}>
              <span className="shop-emoji">{r.emoji}</span>
              <span className="price">{square.room === r.id ? '✓' : `🪙 ${ROOM_PRICE}`}</span>
            </button>
          ))}
        {category?.items.map((item) => (
          <button key={item.id} className={`shop-card ${wallet.coins < item.price ? 'poor' : ''}`} onClick={() => buyItem(item, category.items)}>
            <span className="shop-emoji">{item.emoji}</span>
            <span className="price">🪙 {item.price}</span>
          </button>
        ))}
        {tab === 'build' && (
          <>
            <button className="build-card" onClick={addSquare} disabled={house.width >= MAX_WIDTH}>
              ➕ One more square
              <span className="hint">un quadratino in più su ogni piano</span>
              <span className="price">{house.width >= MAX_WIDTH ? 'Massimo raggiunto' : `🪙 ${squarePrice(house.width, floors)}`}</span>
            </button>
            <button className="build-card" onClick={addFloor} disabled={floors >= MAX_FLOORS}>
              ⬆️ A new floor
              <span className="hint">un piano in più</span>
              <span className="price">{floors >= MAX_FLOORS ? 'Massimo raggiunto' : `🪙 ${floorPrice(floors)}`}</span>
            </button>
          </>
        )}
      </div>

      <p className="stats">
        ⭐ {wallet.stars} stelle · 🎮 {wallet.games} partite · 🐻 {house.missions} missioni · 🪙 {wallet.earned} guadagnate
      </p>

      {quiz && (
        <div className="overlay" onClick={() => setQuiz(null)}>
          <div className="quiz" onClick={(e) => e.stopPropagation()}>
            <p className="hint">Per comprarlo, dimmi come si chiama in inglese!</p>
            <div className="quiz-emoji">{quiz.emoji}</div>
            <p className="quiz-q">What is it?</p>
            <div className="task-options">
              {quiz.options.map((o) => (
                <button
                  key={o}
                  className={`card text-card option ${wrong.includes(o) ? 'shake faded' : ''} ${right === o ? 'right' : ''}`}
                  onClick={() => answer(o)}
                  disabled={wrong.includes(o)}
                >
                  <span className="en">{o}</span>
                </button>
              ))}
            </div>
            <button className="help" onClick={() => setQuiz(null)}>Annulla</button>
          </div>
        </div>
      )}
    </div>
  )
}
