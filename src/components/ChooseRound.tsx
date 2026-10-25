import { useEffect, useState } from 'react'
import type { Word } from '../data/words'
import { playCorrect, playWrong, speak } from '../audio'

type Props = {
  target: Word
  options: Word[]
  // listen: hear the word; read: see the word written; translate: pick the English for an Italian word
  mode: 'listen' | 'read' | 'translate'
  onDone: (firstTry: boolean) => void
}

export function ChooseRound({ target, options, mode, onDone }: Props) {
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    // In translate mode the English word is the answer, so read the Italian word instead.
    const t = setTimeout(() => (mode === 'translate' ? speak(target.it, 'it') : speak(target.en)), 400)
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
        ) : mode === 'read' ? (
          <>
            <p className="hint">Leggi e tocca l'immagine giusta!</p>
            <p className="word">{target.en}</p>
            <p className="answer">{solved ? `= ${target.it}` : ' '}</p>
          </>
        ) : (
          <>
            <p className="hint">Come si dice in inglese?</p>
            <p className="word">{target.it}</p>
            <p className="answer">{solved ? target.emoji : ' '}</p>
          </>
        )}
      </div>

      <div className={`grid choices ${mode === 'translate' ? 'text-choices' : ''}`}>
        {options.map((w) => {
          const isWrong = wrong.includes(w.en)
          const isRight = solved && w === target
          return (
            <button
              key={w.en}
              className={`card ${mode === 'translate' ? 'text-card' : 'big-card'} ${isWrong ? 'shake faded' : ''} ${isRight ? 'pop right' : ''}`}
              onClick={() => choose(w)}
              disabled={isWrong}
            >
              {mode === 'translate' ? <span className="en">{w.en}</span> : <span className="emoji">{w.emoji}</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}
