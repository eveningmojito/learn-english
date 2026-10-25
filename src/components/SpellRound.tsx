import { useEffect, useMemo, useState } from 'react'
import type { Word } from '../data/words'
import { playCorrect, playWrong, speak } from '../audio'
import { shuffle } from '../utils'

type Props = { target: Word; onDone: (firstTry: boolean) => void }

type Tile = { id: number; letter: string }

function makeTiles(word: string): Tile[] {
  const tiles = word.split('').map((letter, id) => ({ id, letter }))
  let mixed = shuffle(tiles)
  // Avoid handing out the answer already in order.
  for (let tries = 0; tries < 5 && mixed.map((t) => t.letter).join('') === word; tries++) mixed = shuffle(tiles)
  return mixed
}

export function SpellRound({ target, onDone }: Props) {
  const word = target.en
  const tiles = useMemo(() => makeTiles(word), [word])
  const [used, setUsed] = useState<number[]>([])
  const [shaking, setShaking] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const typed = used.length
  const solved = typed === word.length

  useEffect(() => {
    const t = setTimeout(() => speak(word), 400)
    return () => clearTimeout(t)
  }, [word])

  function tap(tile: Tile) {
    if (solved || used.includes(tile.id)) return
    if (tile.letter === word[typed]) {
      const next = [...used, tile.id]
      setUsed(next)
      if (next.length === word.length) {
        playCorrect()
        setTimeout(() => speak(word), 500)
        onDone(mistakes === 0)
      }
    } else {
      playWrong()
      setMistakes((m) => m + 1)
      setShaking(tile.id)
    }
  }

  return (
    <div className="question">
      <p className="hint">Scrivi la parola in inglese!</p>
      <button className="picture" onClick={() => speak(word)} aria-label="Ascolta la parola">
        {target.emoji}
      </button>
      <p className="answer small">{target.it}</p>
      <p className="word slots">
        {word.split('').map((l, i) => (
          <span key={i} className={`slot ${i < typed ? 'filled' : ''} ${solved ? 'pop' : ''}`}>
            {i < typed ? l : ' '}
          </span>
        ))}
      </p>
      <div className="letters">
        {tiles.map((t) => (
          <button
            key={t.id}
            className={`tile ${used.includes(t.id) ? 'gone' : ''} ${shaking === t.id ? 'shake' : ''}`}
            onClick={() => tap(t)}
            onAnimationEnd={() => setShaking(null)}
            disabled={used.includes(t.id)}
          >
            {t.letter}
          </button>
        ))}
      </div>
    </div>
  )
}
