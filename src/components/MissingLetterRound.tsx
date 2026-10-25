import { useMemo, useState } from 'react'
import type { Word } from '../data/words'
import { playCorrect, playWrong, speak } from '../audio'
import { shuffle } from '../utils'

type Props = { target: Word; onDone: (firstTry: boolean) => void }

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export function MissingLetterRound({ target, onDone }: Props) {
  const word = target.en
  const { gap, choices } = useMemo(() => {
    const gap = Math.floor(Math.random() * word.length)
    const decoys = shuffle(ALPHABET.filter((l) => l !== word[gap])).slice(0, 2)
    return { gap, choices: shuffle([word[gap], ...decoys]) }
  }, [word])
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)

  function choose(letter: string) {
    if (solved) return
    if (letter === word[gap]) {
      playCorrect()
      setSolved(true)
      setTimeout(() => speak(word), 500)
      onDone(wrong.length === 0)
    } else {
      playWrong()
      setWrong((list) => [...list, letter])
    }
  }

  return (
    <div className="question">
      <p className="hint">Quale lettera manca?</p>
      <button className="picture" onClick={() => speak(word)} aria-label="Ascolta la parola">
        {target.emoji}
      </button>
      <p className="answer small">{target.it}</p>
      <p className="word" aria-label={solved ? word : undefined}>
        {word.split('').map((l, i) =>
          i === gap ? (
            <span key={i} className={`slot ${solved ? 'filled pop' : ''}`}>{solved ? l : ' '}</span>
          ) : (
            <span key={i}>{l}</span>
          ),
        )}
      </p>
      <div className="letters">
        {choices.map((l) => (
          <button
            key={l}
            className={`tile ${wrong.includes(l) ? 'shake faded' : ''}`}
            onClick={() => choose(l)}
            disabled={wrong.includes(l)}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}
