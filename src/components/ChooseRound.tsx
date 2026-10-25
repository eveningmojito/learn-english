import { useEffect, useState } from 'react'
import type { Word } from '../data/words'
import { playCorrect, playWrong, speak } from '../audio'

type Props = {
  target: Word
  options: Word[]
  // listen: hear the word; read: see the word written
  mode: 'listen' | 'read'
  onDone: (firstTry: boolean) => void
}

export function ChooseRound({ target, options, mode, onDone }: Props) {
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    if (mode !== 'listen') return
    const t = setTimeout(() => speak(target.en), 400)
    return () => clearTimeout(t)
  }, [mode, target])

  function choose(w: Word) {
    if (solved) return
    if (w === target) {
      playCorrect()
      setSolved(true)
      setTimeout(() => speak(w.en), 500)
      onDone(wrong.length === 0)
    } else {
      playWrong()
      setWrong((list) => [...list, w.en])
    }
  }

  return (
    <>
      <div className="question">
        {mode === 'listen' ? (
          <>
            <button className="speaker" onClick={() => speak(target.en)} aria-label="Ascolta di nuovo">
              🔊
            </button>
            <p className="hint">Ascolta e tocca l'immagine giusta!</p>
            <p className="answer">{solved ? `${target.en} = ${target.it}` : ' '}</p>
          </>
        ) : (
          <>
            <p className="hint">Leggi e tocca l'immagine giusta!</p>
            <p className="word">{target.en}</p>
            <p className="answer">{solved ? `= ${target.it}` : ' '}</p>
          </>
        )}
      </div>

      <div className="grid choices">
        {options.map((w) => {
          const isWrong = wrong.includes(w.en)
          const isRight = solved && w === target
          return (
            <button
              key={w.en}
              className={`card big-card ${isWrong ? 'shake faded' : ''} ${isRight ? 'pop right' : ''}`}
              onClick={() => choose(w)}
              disabled={isWrong}
            >
              <span className="emoji">{w.emoji}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
