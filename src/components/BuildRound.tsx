import { useEffect, useMemo, useState } from 'react'
import type { Word } from '../data/words'
import { playCorrect, playWrong, speak } from '../audio'
import { shuffle } from '../utils'

// spell: letters with picture; dictation: letters by ear only, plus decoy letters;
// sentence: put the words of a sentence in order.
export type BuildKind = 'spell' | 'dictation' | 'sentence'

type Props = { target: Word; kind: BuildKind; onDone: (firstTry: boolean) => void }

type Tile = { id: number; text: string }

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')
const DECOYS = 3

const HINTS: Record<BuildKind, string> = {
  spell: 'Scrivi la parola in inglese!',
  dictation: 'Ascolta e scrivi la parola!',
  sentence: 'Metti in ordine le parole!',
}

function makeTiles(answer: string[], extras: string[]): Tile[] {
  const tiles = [...answer, ...extras].map((text, id) => ({ id, text }))
  let mixed = shuffle(tiles)
  // Avoid handing out the answer already in order.
  for (let tries = 0; tries < 5 && mixed.slice(0, answer.length).every((t, i) => t.text === answer[i]); tries++) {
    mixed = shuffle(tiles)
  }
  return mixed
}

export function BuildRound({ target, kind, onDone }: Props) {
  const isSentence = kind === 'sentence'
  const answer = useMemo(() => (isSentence ? target.en.split(' ') : target.en.split('')), [target, isSentence])
  const tiles = useMemo(() => {
    const extras = kind === 'dictation' ? shuffle(ALPHABET).slice(0, DECOYS) : []
    return makeTiles(answer, extras)
  }, [answer, kind])
  const [used, setUsed] = useState<number[]>([])
  const [shaking, setShaking] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const typed = used.length
  const solved = typed === answer.length

  useEffect(() => {
    const t = setTimeout(() => speak(target.en), 400)
    return () => clearTimeout(t)
  }, [target])

  function tap(tile: Tile) {
    if (solved || used.includes(tile.id)) return
    if (tile.text === answer[typed]) {
      const next = [...used, tile.id]
      setUsed(next)
      if (next.length === answer.length) {
        playCorrect()
        setTimeout(() => speak(target.en), 500)
        onDone(mistakes === 0)
      }
    } else {
      playWrong()
      setMistakes((m) => m + 1)
      setShaking(tile.id)
    }
  }

  const showPicture = kind !== 'dictation' || solved

  return (
    <div className="question">
      <p className="hint">{HINTS[kind]}</p>
      {showPicture ? (
        <button className="picture" onClick={() => speak(target.en)} aria-label="Ascolta">
          {target.emoji}
        </button>
      ) : (
        <button className="speaker" onClick={() => speak(target.en)} aria-label="Ascolta di nuovo">
          🔊
        </button>
      )}
      <p className={`answer small ${isSentence ? 'sentence-it' : ''}`}>{showPicture ? target.it : ' '}</p>
      {isSentence ? (
        <p className="sentence">
          {answer.map((w, i) => (
            <span key={i} className={`slot word-slot ${i < typed ? 'filled' : ''} ${solved ? 'pop' : ''}`}>
              {i < typed ? w : ' '}
            </span>
          ))}
        </p>
      ) : (
        <p className="word slots">
          {answer.map((l, i) => (
            <span key={i} className={`slot ${i < typed ? 'filled' : ''} ${solved ? 'pop' : ''}`}>
              {i < typed ? l : ' '}
            </span>
          ))}
        </p>
      )}
      <div className="letters">
        {tiles.map((t) => (
          <button
            key={t.id}
            className={`tile ${isSentence ? 'word-tile' : ''} ${used.includes(t.id) ? 'gone' : ''} ${shaking === t.id ? 'shake' : ''}`}
            onClick={() => tap(t)}
            onAnimationEnd={() => setShaking(null)}
            disabled={used.includes(t.id)}
          >
            {t.text}
          </button>
        ))}
      </div>
      {isSentence && !solved && (
        <button className="help" onClick={() => speak(target.en)}>🔊 Ascolta di nuovo</button>
      )}
    </div>
  )
}
